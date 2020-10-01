const crypto = require("crypto");
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { getSalt } = require("../util");

router.post('/login', (req, res) => {
    let knex = req.app.get('db');
    let config = req.app.get('config');

    knex("users")
        .where({username: req.body.username})
        .first()
        .then((user) => {
            if (user) {

                let salt = user.salt;
                let hash = crypto.createHmac('sha512', salt);
                hash.update(req.body.password);

                let passHash = hash.digest('hex');

                if (user.password === passHash) {
                    res.json({
                        username: req.body.username,
                        token: jwt.sign({
                            userId: user.user_id
                        }, config.security.secret)
                    });
                } else {
                    res.status(403);
                    res.send("Username/password is incorrect. Please try again");
                }

            } else {
                res.status(404);
                res.send("User account does not exist.");
            }
        })
})

/*
.post((req, res) => {
      let knex = req.app.get('db');
      let userInfo = req.body;

      if (userInfo.username && userInfo.password) {
        let salt = getSalt(12);
        let hash = crypto.createHmac('sha512', salt);
        hash.update(userInfo.password);

        knex("users")
            .insert({
              username: userInfo.username,
              password: hash.digest('hex'),
              email: userInfo.email,
              salt: salt,
              firstname: userInfo.firstname,
              lastname: userInfo.lastname
            })
            .returning("user_id")
            .then((ids) => {
              if (ids.length > 0) {
                userInfo.userId = ids[0];

                res.json(userInfo);
              } else {
                res.sendStatus(500);
              }
            });
      } else {
        res.sendStatus(400);
      }
    })
 */

router.post('/register', (req, res) => {
    let knex = req.app.get('db');
    let userInfo = req.body;

    if (userInfo.username && userInfo.password) {
        let salt = getSalt(12);
        let hash = crypto.createHmac('sha512', salt);
        hash.update(userInfo.password);

        let passHash = hash.digest('hex');

        knex("users")
            .insert({
                username: userInfo.username,
                password: passHash,
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
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;
