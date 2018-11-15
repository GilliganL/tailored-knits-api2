'use strict';

const express = require('express');
const router = express.Router();
const validator = require('validator');
const passport = require('passport');

const { User, passwordSchema } = require('./models');

const jwtAuth = passport.authenticate('jwt', { session: false });

router.post('/', (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'username', 'password', 'email'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if(missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'The form is missing a field.',
            location: missingField
        });
    }

    const nameFields = ['firstName', 'lastName'];
    const invalidName = nameFields.find(
        field => field in req.body && !(validator.isAlpha(req.body[field]))
    );
    if(invalidName) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'First and last name may only contain letters.',
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
            message: 'Password and username cannot start or end with a space.',
            location: nonTrimmedFields
        });
    }

    if (!(validator.isEmail(req.body.email))) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Please enter a valid email address',
            location: 'Email'
        });
    }

    if (!(passwordSchema.validate(req.body.password))) {
        const failed = passwordSchema.validate(req.body.password, { list: true });
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Password must be between 8 and 72 characters with at least 1 uppercase and lowercase letters and 1 number.',
            location: 'Password'
        });
    }
    
    User 
        .findOne({ username: req.body.username })
        .then(user => {
            if(user) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username is not available.',
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
        .then(user => res.status(200).json(user.serialize()))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error'})
        });
});

router.use(jwtAuth);

router.get('/', (req, res) => {
    return User.find()
        .then(users => res.json(users.map(user => user.serialize())))
        .catch(err => 
            res.status(500).json({message: 'Internal server error'})
        )
});

router.get('/:id', (req, res) => {
    User
        .findById(req.params.id)
        .then(user => res.status(200).json(user.serialize()))
        .catch(err => 
            res.status(500).json({message: 'Internal server error'})
        )
});

router.put('/:id', (req, res) => {
   
    const updated = {};
    const updateFields = ['firstName', 'lastName', 'email', 'password', 'passwordCurrent', 'chest', 'waist', 'hips', 'upperArm', 'armhole', 'length', 'wrist'];
    updateFields.forEach(field => {
        if (req.body[field]) {
            updated[field] = req.body[field];
        }
    })

    const nameFields = ['firstName', 'lastName'];
    const invalidName = nameFields.find(
        field => field in updated && !(validator.isAlpha(updated[field]))
    );
    if(invalidName) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'First and last name may only contain letters.',
            location: invalidName
        });
    }

    if (updated.email && !(validator.isEmail(updated.email))) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Please enter a valid email address.',
            location: 'email'
        });
    }

    if(updated.password !== updated.password.trim()) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Password cannot start or end with a space.',
            location: nonTrimmedFields
        });
    }

    if (updated.password && !(passwordSchema.validate(updated.password))) {
        const failed = passwordSchema.validate(req.body.password, { list: true });
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Password must be between 8 and 72 characters with at least 1 uppercase and lowercase letters and 1 number.',
            location: 'Password'
        });
    } else if (updated.password && passwordSchema.validate(updated.password)) {
        User.findById(req.user.id)
        .then(user => user.validatePassword(updated.passwordCurrent))
        .then(isValid => {
            return isValid ?
                User.hashPassword(updated.password) :
                Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Current password is incorrect.',
                    location: 'Password' })
        })
        .then(hash => { 
            updated.password = hash
            updateUser(req, res, updated)
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error'})
        });
    } else {
        updateUser(req, res, updated)
    }
});

function updateUser(req, res, updated) {
    User 
    .findOneAndUpdate({_id: req.params.id}, { $set: updated }, { new: true })
    .then(user => res.status(200).json(user.serialize()))
    .catch(err => {
        if (err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        res.status(500).json({ error: 'Internal server error'})
    });
}

router.delete('/:id', (req, res) => {
    if (req.params.id !== req.user.id) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'The IDs do not match',
            location: 'Parameter and Request IDs'
        });
    }

    User
        .findByIdAndRemove(req.user.id)
        .then(() => {
            res.status(200).json({ message: 'success' })
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error'})
        });
});

module.exports = { router };