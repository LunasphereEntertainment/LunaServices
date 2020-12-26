var express = require('express');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});*/

router.route('/:userId')
    /*.all((req, res, next) => {
      req.knex = req.app.get('db');
      next();
    })*/
    .all((req, res, next) => {
        let userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).send("UserID invalid or unrecognized.");
        } else {
            next();
        }
    })
    .get((req, res) => {
      let knex = req.app.get('db');
      knex("users")
          .select("user_id", "username", "email", "firstname", "lastname")
          .where({"user_id": req.params.userId})
          .first()
          .then((result) => {
            if (result) {
              res.json(result);
            } else {
              res.status(404);
              res.send("Requested user could not be found.");
            }
          });
    })
    .put((req, res) => {
      let knex = req.app.get('db');
      let userInfo = req.body;

      let updateObj = {};
      let validUpdates = ['firstname', 'lastname', 'email'];
      for (let key in userInfo) {
          if (validUpdates.includes(key))
              updateObj[key] = userInfo[key];
      }

      knex("users")
          .where({user_id: req.params.userId})
          .update(updateObj)
          .then(() => {
            res.sendStatus(204);
          })

    })
    .delete((req, res) => {
      let knex = req.app.get('db');
      knex("users")
          .del()
          .where({
            user_id: req.params.userId
          })
          .then(() => {
            res.sendStatus(204);
          })
    });

module.exports = router;
