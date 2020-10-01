const {Router} = require('express');
const router = Router();

router.get('/:workspaceId/projects', (req, res) => {
    let knex = req.app.get('db');
    let config = req.app.get('config');

    let query = knex("projects")
        .where({workspace_id: req.params.workspaceId})
        .limit(config.paging.size);

    if (req.query['page']) {
        let page = parseInt(req.query['page']);
        if (!isNaN(page)) {
            query.offset(page);
        }
    }

    query.then((results) => {
        res.json(results);
    });
});

router.route('/:workspaceId/:projectId')
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("projects")
            .where({
                workspace_id: req.params.workspaceId,
                project_id: req.params.projectId
            })
            .first()
            .then((result) => {
                if (result) {
                    knex("ln_project_language")
                        .select("programming_languages.*")
                        .where({project_id: req.params.projectId})
                        .join("programming_languages", {'programming_languages.lang_id' : 'ln_project_language.p_lang_id'})
                        .then((langs) => {
                            result.languages = langs;
                            res.json(result);
                        })
                } else {
                    res.status(404)
                        .send("Requested project does not exist.");
                }
            });
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let project = req.body;

        knex.transaction((trx) => {
            knex("projects").transacting(trx)
                .insert({
                    workspace_id: req.params.workspaceId,
                    name: project.name,
                    bio: project.bio
                })
                .returning("project_id")
                .then((ids) => {
                    if (ids.length > 0) {
                        project.projectId = ids[0];

                        res.json(project);
                    } else {
                        res.sendStatus(500);
                    }
                });
        })


    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let project = req.body;

        knex.transaction((trx) => {
            // Update static information...
            knex("projects").transacting(trx)
                .update({
                    name: project.name,
                    bio: project.bio
                })
                .where({
                    project_id: req.params.projectid,
                    workspace_id: req.params.workspaceId
                })
                .then(() => {
                    res.json(project);
                })
                .catch(() => {trx.rollback(), res.sendStatus(500);});
        })


    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        // Begin transaction
        knex.transaction((trx) => {
            // Check project exists in workspace
            knex("projects").transacting(trx)
                .where({project_id: req.params.projectId, workspace_id: req.params.workspaceId})
                .first()
                .then((result) => {
                    if (result) {
                        // Delete: language links
                        let delLang = knex("ln_project_language").transacting(trx)
                            .where({project_id: req.params.projectId})
                            .del();

                        // Delete: tags
                        let delTags = knex("project_tags").transacting(trx)
                            .where({project_id: req.params.projectId})
                            .del();

                        // Delete: permissions
                        let delPerms = knex("project_permissions").transacting(trx)
                            .where({project_id: req.params.projectId})
                            .del();

                        // Delete: tasks (cascade?)
                        let delTasks = knex("tasks").transacting(trx)
                            .where({project_id: req.params.projectId})
                            .del();

                        // Delete: project
                        Promise.all([delLang, delTags, delPerms, delTasks])
                            .then(() => {
                                knex("projects").transacting(trx)
                                    .where({project_id: req.params.projectId})
                                    .del()
                                    .then(trx.commit)
                                    .catch(trx.rollback);
                            });
                    } else {
                        res.status(404)
                            .send("Project could not be found.");
                    }
                })
        });
    })


module.exports = router;
