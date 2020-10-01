const express = require('express');
const router = express.Router();

router.get('/:postId/comments', (req, res) => {
    let knex = req.app.get('db');
    knex("ln_post_comments")
        .select(knex.raw("comments.*"))
        .join("comments", {'ln_post_comments.comment_id': 'comments.comment_id'})
        .where({'ln_post_comments.comment_id': req.params.postId})
        .then((results) => {
            res.json(results);
        })
});

router.get('/:taskId/comments', (req, res) => {
    let knex = req.app.get('db');
    knex("ln_task_comments")
        .select(knex.raw("comments.*"))
        .join("comments", {'ln_task_comments.comment_id': 'comments.comment_id'})
        .where({'ln_task_comments.comment_id': req.params.taskId})
        .then((results) => {
            res.json(results);
        });
});

router.route('/:postId/:commentId')
    .get((req, res) => {
        let knex = req.app.get('db');
        knex("comments")
            .where({comment_id: req.params.commentId})
            .first()
            .then((result) => {
                if (result) {
                    res.json(result);
                } else {
                    res.status(404)
                        .send("No comment found");
                }
            })
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let comment = req.body;

        knex("comments")
            .insert({
                comment_id: req.params.commentId,
                author_id: req.user.userId,
                content: comment.content
            })
            .returning("comment_id")
            .then((ids) => {
                if (ids.length > 0) {

                    comment.commentId = ids[0];

                    knex("ln_post_comments")
                        .insert({
                            post_id: req.params.postId,
                            comment_id: comment.commentId
                        })
                        .then(() => {
                            res.json(comment);
                        })

                } else {
                    res.sendStatus(500);
                }
            });
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("comments")
            .select("comment_id")
            .where({
                comment_id: req.params.commentId,
                author_id: req.user.userId
            })
            .first()
            .then((comment) => {
                if (comment) {
                    knex("ln_post_comments")
                        .where({
                            post_id: req.params.postId,
                            comment_id: req.params.commentId
                        })
                        .del()
                        .then(() => {
                            knex("comments")
                                .where({
                                    comment_id: req.params.commentId
                                })
                                .del()
                                .then(() => {
                                    res.sendStatus(204);
                                })
                        })
                } else {
                    res.status(400)
                        .send("Comment does not exist, or you do not have permission to delete.");
                }
            })
    })

router.route('/:taskId/:commentId')
    .get((req, res) => {
        let knex = req.app.get('db');
        knex("comments")
            .where({comment_id: req.params.commentId})
            .first()
            .then((result) => {
                if (result) {
                    res.json(result);
                } else {
                    res.status(404)
                        .send("No comment found");
                }
            })
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let comment = req.body;

        knex("comments")
            .insert({
                comment_id: req.params.commentId,
                author_id: req.user.userId,
                content: comment.content
            })
            .returning("comment_id")
            .then((ids) => {
                if (ids.length > 0) {

                    comment.commentId = ids[0];

                    knex("ln_task_comments")
                        .insert({
                            task_id: req.params.taskId,
                            comment_id: comment.commentId
                        })
                        .then(() => {
                            res.json(comment);
                        })

                } else {
                    res.sendStatus(500);
                }
            });
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("comments")
            .select("comment_id")
            .where({
                comment_id: req.params.commentId,
                author_id: req.user.userId
            })
            .first()
            .then((comment) => {
                if (comment) {
                    knex("ln_task_comments")
                        .where({
                            task_id: req.params.taskId,
                            comment_id: req.params.commentId
                        })
                        .del()
                        .then(() => {
                            knex("comments")
                                .where({
                                    comment_id: req.params.commentId
                                })
                                .del()
                                .then(() => {
                                    res.sendStatus(204);
                                })
                        })
                } else {
                    res.status(400)
                        .send("Comment does not exist, or you do not have permission to delete.");
                }
            })
    })

module.exports = router;
