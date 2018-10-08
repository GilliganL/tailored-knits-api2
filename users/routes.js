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
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredField[i];
        if(!(field in req.body)) {
            const message = `Missing \'${field}\'`;
            console.error(message);
            return res.status(400).json({error: message});
        }
    };

    if (!(validator.isAlpha(req.body.firstName)) || !(validator.isAlpha(req.body.lastName))) {
        const message = `First and last name can only contain letters`;
        console.error(message);
        return res.status(400).json({error: message});
    };

    if (!(validator.isEmail(req.body.email))) {
        const message = `Please enter a valid email address`;
        console.error(message);
        return res.status(400).json({error: message});
    };

    if (!(validator.isAlphanumeric(req.body.username)) || (req.body.username.trim() !== req.body.username)) {
        const message = 'Please use letters and numbers only in username';
        console.error(message);
        return res.status(400).json({error: message});
    };

    if (!(passwordSchema.validate(req.body.password))) {
        const failed = passwordSchema.validate(req.body.password, { list: true });
        let message = 'Password must contain at least 8 characters including 1 uppercase letter and 1 number';
        console.error(message);
        return res.status(400).json({error: message});
    };
    
    User 
        .findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                const message = 'username already taken';
                console.error(message);
                return res.status(400).json({ error: message });
            }
            return User.hashPassword(req.body.password);
        })
        .then(hash => {
            return User
                .create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                })
        })
        .then(user => res.status(201).json(user.serialize()))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went wrong'})
        });
});

module.exports = router;