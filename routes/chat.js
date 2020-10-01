const { Router } = require("express");
const router = Router();

// ADD USER to channel
router.put('/:channelId/users/:userId', (req, res) => {
    let knex = req.app.get('db');

    knex("channel_members")
        .insert({
            channel_id: req.params.channelId,
            user_id: req.params.userId
        })
        .then(() => {
            res.sendStatus(204);
        })
        .catch(() => {
            res.sendStatus(304);
        })
});

// REMOVE USER from channel
router.delete('/:channelId/users/:userId', (req, res) => {
    let knex = req.app.get('db');

    knex("programming_languages")
        .where({
            channel_id: req.params.channelId,
            user_id: req.params.userId
        })
        .del()
        .then((count) => {
            if (count > 0) {
                res.sendStatus(204);
            } else {
                res.sendStatus(304);
            }
        })
})

router.get('/:channelId/users', (req, res) => {
    let knex = req.app.get('db');

    knex("channel_members")
        .where({
            channel_id: req.params.channelId
        })
        .join("users", {'users.user_id': 'channel_members.user_id'})
        .then((results) => {
            res.json(results);
        });
});

router.get('/:channelId/history', (req, res) => {
    let knex = req.app.get('db');
    let config = req.app.get('config');

    let query = knex("chat_messages")
        .where({
            channel_id: req.params.channelId
        })
        .limit(config.paging.size);

    if (req.params['page']) {
        let page = parseInt(req.params['page']);
        if (!isNaN(page)) {
            query.offset(page * config.paging.size);
        }
    }

    query.then((results) => {
        res.json(results);
    })
});

router.route('/:channelId/:messageId')
    .post((req, res) => {
        let knex = req.app.get('db');

        let msg = req.body;

        knex("chat_messages")
            .insert({
                author_id: req.user.userId,
                content: msg.content
            })
            .returning("message_id")
            .then((ids) => {
                if (ids.length > 0) {
                    msg.messageId = ids[0];
                    res.json(msg);
                } else {
                    res.sendStatus(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let msg = req.body;

        knex("chat_messages")
            .update({
                content: msg.content
            })
            .where({
                author_id: req.user.userId,
                message_id: req.params.messageId
            })
            .then(() => {
                res.json(msg);
            })
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("chat_messages")
            .where({
                author_id: req.user.userId,
                message_id: req.params.messageId
            })
            .del()
            .then(() => {
                res.sendStatus(204);
            })
    });

router.route('/:channelId')
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("chat_channel")
            .where({
                channel_id: req.params.channelId
            })
            .first()
            .then((result) => {
                if (result)
                    res.json(result);
                else
                    res.status(404).send("Requested resource not found.");
            })
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let channel = req.body;

        knex("chat_channel")
            .insert({
                name: channel.name
            })
            .returning("channel_id")
            .then((ids) => {
                if (ids.length > 0) {
                    channel.id = ids[0];
                    res.json(channel);
                } else {
                    res.sendStatus(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let channel = req.body;

        knex("chat_channel")
            .update({
                name: channel.name
            })
            .where({
                channel_id: req.params.channelId
            })
            .then(() => {
                res.json(channel);
            })

    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        // Mark Channel Deleted
        knex("chat_channel")
            .update({
                is_deleted: true
            })
            .where({
                channel_id: req.params.channelId
            })
            .then(() => {
                res.sendStatus(204);
            })
    });

module.exports = router;
