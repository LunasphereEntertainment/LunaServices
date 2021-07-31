const argon2 = require("argon2");
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { encrypt } = require("../../shared/encrypt");

const {genSalt, legacyAuth} = require("../util");

// Rate Limit - Do not permit more than...
router.use(rateLimit({
    max: 10, // 10 requests
    windowMs: 30 * 60 * 1000 // in a 30 minute window
}));

router.post('/login', (req, res) => {
    let knex = req.app.get('db');
    let config = req.app.get('config');

    knex("users")
        .where({username: req.body.username})
        .first()
        .then((user) => {
            if (user) {
                let salt = user.salt;

                let now = new Date();
                if (user.password.includes("$")) {
                    argon2.verify(user.password, `${req.body.password}${salt}`).then((result) => {
                        if (result) {

                            let tkBody = {
                                userId: user.user_id
                            }

                            if (req.query['includeKey']) {
                                tkBody.pKey = encrypt(req.body.password);
                            }

                            res.json({
                                username: req.body.username,
                                token: jwt.sign(tkBody, config['security']['secret'])
                            });
                        } else {
                            res.status(403)
                                .send("Username/password is incorrect. Please try again.");
                        }
                    });
                } else {
                    if (now.getTime() <= 1614556800000) {
                        if (legacyAuth(req.body.password, user.salt, user.password)) {
                            // Perform security upgrade for this account...
                            let newSalt = genSalt(12);

                            argon2.hash(`${req.body.password}${newSalt}`).then((hash) => {
                                knex("users")
                                    .update({
                                        password: hash,
                                        salt: newSalt
                                    })
                                    .where({
                                        user_id: user.user_id
                                    })
                                    .then(() => {
                                        res.json({
                                            username: user.username,
                                            token: jwt.sign({
                                                userId: user.user_id
                                            }, config.security.secret)
                                        })
                                    })
                            })
                        } else {
                            res.status(403)
                                .send("Username/password is incorrect. Please try again.");
                        }
                    } else {
                        // This account may need upgrading.
                        res.status(403);
                        res.send("Username/password is incorrect. Please try again.\nYour account may have been deactivated due to inactivity. If so, proceed with resetting your password below.");
                    }
                }
            } else {
                res.status(404);
                res.send("User account does not exist.");
            }
        });
});

router.post('/register', (req, res) => {
    let knex = req.app.get('db');
    let userInfo = req.body;

    if (userInfo.username && userInfo.password) {
        let salt = genSalt(12);
        argon2.hash(`${userInfo.password}${salt}`).then((hash) => {

            knex("users")
                .insert({
                    username: userInfo.username,
                    password: hash,
                    email: userInfo.email,
                    salt: salt,
                    firstname: userInfo.firstname,
                    lastname: userInfo.lastname
                })
                .returning("user_id")
                .then((ids) => {
                    if (ids.length > 0) {
                        userInfo.userId = ids[0];
                        delete userInfo.password;

                        res.json(userInfo);
                    } else {
                        res.sendStatus(500);
                    }
                });
        })
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;
