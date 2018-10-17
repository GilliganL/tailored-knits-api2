'use strict';

require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');

const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { router: usersRouter } = require('./users');
const { router: projectsRouter } = require('./projects');
const { router: patternsRouter } = require('./patterns');

mongoose.Promise = global.Promise;

const app = express();
const jsonParser = bodyParser.json();

app.use(express.json());
app.use(morgan('common'));

app.use(express.static('public'));

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

//What is the difference between line 19 and this:
// app.use(function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
//     res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
//     if(req.method === 'OPTIONS') {
//         return res.send(204);
//     }
//     next();
// });

app.use('/api/auth/', authRouter);
app.use('/api/users/', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/patterns', patternsRouter);

app.use((req, res, next) => {
    res.sendStatus(404);
    next();
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json(error);
    next();
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };