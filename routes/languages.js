const {Router} = require("express");
const router = Router();

router.route('/:projectId/languages/:languageId')
    .put((req, res) => {
        let knex = req.app.get('db');

        knex("ln_project_language")
            .insert({
                project_id: req.params.projectId,
                p_lang_id: req.params.languageId
            })
            .then(() => {
                // Success - modified
                res.sendStatus(204);
            })
            .catch(() => {
                // Failed - Likely already exists, 304 - Not Modified
                res.sendStatus(304);
            });
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("ln_project_language")
            .where({
                project_id: req.params.projectId,
                p_lang_id: req.params.languageId
            })
            .del()
            .then((count) => {
                if (count > 0) {
                    // Success
                    res.sendStatus(204);
                } else {
                    // Nothing to delete - 304 - Not Modified.
                    res.sendStatus(304);
                }
            })
    });

router.get('/list', (req, res) => {
    let knex = req.app.get('db');
    knex("programming_languages")
        .then((results) => {
            res.json(results);
        })
});

router.route('/:languageId')
    .get((req, res) => {
        let knex = req.app.get('db');
        knex("programming_languages")
            .where({
                lang_id: req.params.languageId
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

        let language = req.body;

        knex("programming_languages")
            .insert({
                name: language.name,
                bio: language.bio
            })
            .returning("lang_id")
            .then((ids) => {
                if (ids.length > 0) {
                    language.langId = ids[0];
                    res.json(language);
                } else {
                    res.sendStatus(500);
                }
            })
    })
    .put((req, res) => {
        let knex = req.app.get('db');

        let language = req.body;

        knex("programming_languages")
            .update({
                name: language.name,
                bio: language.bio
            })
            .where({
                lang_id: req.params.languageId
            })
            .then(() => {
                res.json(language);
            })
    })
    .delete((req, res) => {
        let knex = req.app.get('db');

        knex("programming_languages")
            .where({
                lang_id: req.params.languageId
            })
            .del()
            .then(() => {
                res.sendStatus(204);
            })
    })

module.exports = router;
