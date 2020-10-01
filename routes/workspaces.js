const express = require('express');
const router = express.Router();

router.get('/list', (req, res) => {
    let knex = req.app.get('db');

    knex("user_workspace_perms")
        .select(knex.raw("workspaces.*"))
        .join("workspaces", {'workspaces.workspace_id': 'user_workspace_perms.workspace_id'})
        .where({
            user_id: req.user.userId
        })
        .then((workspaces) => {
            res.json(workspaces);
        })
})

router.route('/:workspaceId')
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("workspaces")
            .where({workspace_id: req.params.workspaceId})
            .first()
            .then((result) => {
                if (result)
                    res.json(result);
                else
                    res.status(404)
                        .send("Workspace not found.");
            })
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let workspace = req.body;

        knex("workspaces")
            .insert({
                workspace_name: workspace.name,
                workspace_bio: workspace.bio
            })
            .returning("workspace_id")
            .then((ids) => {
                if (ids.length > 0) {
                    workspace.workspace_id = ids[0];

                    knex("user_workspace_perms")
                        .insert({
                            workspace_id: workspace.workspace_id,
                            user_id: req.user.userId,
                            permission_mask: -1
                        })
                        .then(() => {
                            res.json(workspace);
                        })
                } else {
                    res.sendStatus(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let workspace = req.body;

        knex("workspaces")
            .update({
                workspace_name: workspace.name,
                workspace_bio: workspace.bio
            })
            .where({
                workspace_id: req.params.workspaceId
            })
            .then(() => {
                res.json(workspace);
            })
    })
    .delete((req, res) => {
        res.sendStatus(501);
        // TODO: Delete all projects associated
        // TODO: Delete all permission associated with projects
        // TODO: Delete all permissions associated with workspace
        // TODO: Delete workspace
        /*let knex = req.app.get('db');

        knex("projects")
            .where({
                workspace_id: req.params.workspaceId
            })
            .then(() => {

            })
        knex("user_project_permissions")
            .where({
                project_id
            })*/
    })

module.exports = router;
