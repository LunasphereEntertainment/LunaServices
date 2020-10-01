var express = require('express');
var router = express.Router();

router.get('/:workspaceId/posts', (req, res) => {
    let knex = req.app.get('db');

    knex("ln_workspace_posts")
        .select(knex.raw("workspace.*"))
        .where({workspace_id: req.params.workspaceId})
        .join("workspaces", {'ln_workspace_posts': 'workspaces.workspace_id'})
        .then((posts) => {
            res.json(posts);
        })
});

router.route('/:workspaceId/:postId')
    .get((req, res) => {
        let knex = req.app.get('db');
        knex("posts")
            .where({
                workspace_id: req.params.workspaceId,
                post_id: req.params.postId
            })
            .first()
            .then((result) => {
                if (result)
                    res.json(result);
                else
                    res.status(404)
                        .send("No matching post found");
            });
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let post = req.body;
        knex("posts")
            .insert({
                workspace_id: req.params.workspaceId || 1,
                author_id: req.user.userId,
                header: post.header,
                body: post.body
            })
            .returning("post_id")
            .then((ids) => {
                if (ids.length > 0) {
                    post.postId = ids[0];
                    res.json(post);
                } else {
                    res.sendStatus(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let post = req.body;

        knex("posts")
            .update({
                header: post.header,
                body: post.body
            })
            .where({
                workspace_id: req.params.workspaceId,
                post_id: req.params.postId
            })
            .then(() => {
                res.json(post);
            });
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("comments")


        knex("posts")
            .where({
                workspace_id: req.params.workspaceId,
                author_id: req.user.userId,
                post_id: req.params.postId
            })
            .del()
            .then((count) => {
                if (count > 0) {
                    res.sendStatus(204);
                } else {
                    res.sendStatus(400);
                }
            })
    });

module.exports = router;
