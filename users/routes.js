'use strict';

const express = require('express');
const router = express.Router();

//Do I need to validate passwords here if I'm doing it on the front end?
const validator = require('validator');
const passport = require('passport');

const { User, passwordSchema } = require('./models');

const jwt = passport.authenticate('jwt', { session: false });

router.post('/', (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'username', 'password', 'email'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if(missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const nameFields = ['firstName', 'lastName'];
    const invalidName = nameFields.find(
        field => field in req.body && !(validator.isAlpha(field))
    );

    if(invalidName) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: only letters allowed',
            location: invalidName
        });
    }

    const trimmedFields = ['username', 'password'];
    const nonTrimmedFields = trimmedFields.find(
        field => req.body[field].trim() !== req.body[field]
    );

    if(nonTrimmedFields) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with a space',
            location: nonTrimmedFields
        });
    }

    if (!(validator.isEmail(req.body.email))) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Not a valid email address',
            location: req.body.email
        });
    }


    if (!(passwordSchema.validate(req.body.password))) {
        const failed = passwordSchema.validate(req.body.password, { list: true });
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: failed,
            location: req.body.password
        });
    }
    
    User 
        .findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return User.hashPassword(req.body.password);
        })
        .then(hash => {
            return User
                .create({
                    firstName: req.body.firstName.trim(),
                    lastName: req.body.lastName.trim(),
                    username: req.body.username,
                    email: req.body.email.trim(),
                    password: hash
                })
        })
        .then(user => res.status(201).json(user.serialize()))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error'})
        });
});

router.get('/', (req, res) => {
    return User.find()
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => 
            res.status(500).json({message: 'Internal server error'})
        )
});

module.exports = { router };