const config = require("./config.json");
const knex = require("knex")(config.db);
const express = require('express');
const path = require('path');
const jwt = require('express-jwt');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const socialRouter = require('./routes/social');
const authRouter = require('./routes/auth');
const commentsRouter = require('./routes/comments');
const workspacesRouter = require('./routes/workspaces');
const projectsRouter = require('./routes/projects');
const taskingRouter = require('./routes/tasks');
const languagesRouter = require('./routes/languages');

const app = express();
app.set('db', knex);
app.set('config', config);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);

app.use(jwt({secret: config.security.secret, algorithms: ['HS256']}));
app.use('/api/users', usersRouter);
app.use('/api/social', socialRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasking', taskingRouter);
app.use('/api/languages', languagesRouter);

module.exports = app;
