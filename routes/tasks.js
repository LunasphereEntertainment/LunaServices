const {Router} = require("express");
const router = Router();


router.get('/:projectId/tasks', (req, res) => {
    let knex = req.app.get('db');
    let config = req.app.get('config');

    if (req.query['search']) {
        knex("tasks")
            .where("task_name", 'like', `%${req.query['search']}%`)
            .orWhere("task_description", 'like', `%${req.query['search']}%`)
            .then((results) => {
                res.json(results);
            })
    } else {
        let query = knex("tasks")
            .where({
                project_id: req.params.projectId
            })
            .limit(config.paging.size);

        if (req.query['page']) {
            let page = parseInt(req.query['page']);
            if (!isNaN(page)) {
                query.offset(page * config.paging.size);
            }
        }

        query.then((results) => {
            res.json(results);
        });
    }
});

router.get('/:projectId/task/types', (req, res) => {
    let knex = req.app.get('db');
    knex("task_type")
        .where({
            project_id: req.params.projectId
        })
        .then((results) => {
            res.json(results);
        })
});

router.route('/:projectId/task/:typeId')
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("task_type")
            .where({
                type_id: req.params.typeId,
                project_id: req.params.projectId
            })
            .first()
            .then((type) => {
                if (type)
                    res.json(type);
                else
                    res.status(404).send("Task type not found.");
            })
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let type = req.body;

        knex("task_type")
            .insert({
                type_name: type.name,
                project_id: req.params.projectId
            })
            .returning("type_id")
            .then((ids) => {
                if (ids.length > 0) {
                    type.typeId = ids[0];
                    res.json(type);
                } else {
                    res.status(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let type = req.body;

        knex("task_type")
            .update({
                type_name: type.name
            })
            .where({
                type_id: req.params.typeId,
                project_id: req.params.projectId
            })
            .then(() => {
                res.json(type);
            })
    })
    .delete((req, res) => {
        // Not implemented (YET)
        res.sendStatus(501);
    })

router.route('/:projectId/:taskId')
    .get((req, res) => {
        let knex = req.app.get('db');

        knex("tasks")
            //.select("tasks.task_id", "tasks.task_name", "tasks.task_description", "tasks.task_status", "tasks.assignee", knex.raw("\"task_type\".\"type_name\" as \"task_type\"")
            .where({
                task_id: req.params.taskId,
                projectId: req.params.projectId
            })
            //.join("task_type", {'task_type.type_id': 'tasks.task_type'})
            //.join("users", {''})
            .first()
            .then((task) => {
                if (task)
                    res.json(task);
                else
                    res.status(404)
                        .send("Task not found.");
            })
    })
    .post((req, res) => {
        let knex = req.app.get('db');

        let task = req.body;

        knex("tasks")
            .insert({
                project_id: req.params.projectId,
                task_type: task.type,
                task_name: task.name,
                task_description: task.description,
                task_status: task.status,
                task_assignee: task.assignee
            })
            .returning("task_id")
            .then((ids) => {
                if (ids.length > 0) {
                    task.taskId = ids[0];

                    res.json(task);
                } else {
                    res.status(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let task = req.body;

        knex("tasks")
            .update({
                task_type: task.type,
                task_name: task.name,
                task_description: task.description,
                task_status: task.status,
                task_assignee: task.assignee
            })
            .where({
                project_id: req.params.projectId,
                task_Id: req.params.taskId
            })
            .then(() => {
                res.json(task);
            })
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("tasks")
            .where({
                project_id: req.params.projectId,
                task_id: req.params.taskId
            })
            .del()
            .then(() => {
                res.sendStatus(204);
            })
    })

module.exports = router;
