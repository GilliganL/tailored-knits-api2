'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { User } = require('../users/models');
const { Project } = require('./models');

router.get('/', (req, res) => {
    console.log(req.user)
    return Project
        .find()
        .then(projects => res.json(projects))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.get('/:id', (req, res) => {
    //add check for body id and parameter id??
    User
        .findById(req.params.id, 'id username firstName lastName email')
        .then(user => res.status(201).json(user))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});


router.post('/', (req, res) => {
    console.log(req.user)
    const {
        user,
        name,
        created,
        size,
        style,
        pattern
    } = req.body;

    console.log(req.body)

    // const requiredFields = ['firstName', 'lastName', 'username', 'password', 'email'];
    // const missingField = requiredFields.find(field => !(field in req.body));

    // if(missingField) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'Missing field',
    //         location: missingField
    //     });
    // }

    // const nameFields = ['firstName', 'lastName'];
    // const invalidName = nameFields.find(
    //     field => field in req.body && !(validator.isAlpha(field))
    // );

    // if(invalidName) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'Incorrect field type: only letters allowed',
    //         location: invalidName
    //     });
    // }

    // const trimmedFields = ['username', 'password'];
    // const nonTrimmedFields = trimmedFields.find(
    //     field => req.body[field].trim() !== req.body[field]
    // );

    // if(nonTrimmedFields) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'Cannot start or end with a space',
    //         location: nonTrimmedFields
    //     });
    // }

    // if (!(validator.isEmail(req.body.email))) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'Not a valid email address',
    //         location: 'Email'
    //     });
    // }

    // if (!(passwordSchema.validate(req.body.password))) {
    //     const failed = passwordSchema.validate(req.body.password, { list: true });
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: failed,
    //         location: 'Password'
    //     });
    // }

    Project
        .create({
            _id: new mongoose.Types.ObjectId(),
            user,
            name,
            created,
            size,
            style,
            pattern
        })
        .then(project => res.status(201).json(project))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

// router.put('/:id', (req, res) => {

//     const updated = {};
//     const updateFields = ['firstName', 'lastName', 'email', 'password'];
//     updateFields.forEach(field => {
//         if (req.body[field]) {
//             updated[field] = req.body[field];
//         }
//     })

//     const nameFields = ['firstName', 'lastName'];
//     const invalidName = nameFields.find(
//         field => field in updated && !(validator.isAlpha(updated[field]))
//     );

//     if(invalidName) {
//         return res.status(422).json({
//             code: 422,
//             reason: 'ValidationError',
//             message: 'Incorrect field type: only letters allowed',
//             location: invalidName
//         });
//     }

//     if (updated.email && !(validator.isEmail(updated.email))) {
//         return res.status(422).json({
//             code: 422,
//             reason: 'ValidationError',
//             message: 'Not a valid email address',
//             location: 'email'
//         });
//     }

//     //how do you update a password?
//     if (updated.password && !(passwordSchema.validate(updated.password))) {
//         const failed = passwordSchema.validate(req.body.password, { list: true });
//         return res.status(422).json({
//             code: 422,
//             reason: 'ValidationError',
//             message: failed,
//             location: 'Password'
//         });
//     } else if (updated.password && passwordSchema.validate(updated.password)) {
//         User
//         .hashPassword(updated.password)
//         .then(hash => updated.password = hash)
//     }

//     User 
//     .findOneAndUpdate({_id: req.params.id}, { $set: updated }, { new: true })
//     .then(updatedUser => {
//         res.status(201).json(updatedUser)
//     })
//     .catch(err => {
//         if (err.reason === 'ValidationError') {
//             return res.status(err.code).json(err);
//         }
//         res.status(500).json({ error: 'Internal server error'})
//     });
// });

// router.delete('/:id', (req, res) => {
//     if (req.params.id !== req.body.id) {
//         return res.status(422).json({
//             code: 422,
//             reason: 'ValidationError',
//             message: 'The IDs do not match',
//             location: 'Parameter and Request IDs'
//         });
//     }

//     User
//         .findByIdAndRemove(req.body.id)
//         .then(() => {
//             res.status(200).json({ message: 'success' })
//         })
//         .catch(err => {
//             res.status(500).json({ error: 'Internal server error'})
//         });
// });

module.exports = { router };