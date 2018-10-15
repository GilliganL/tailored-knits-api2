'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const { Project } = require('./models');

router.get('/', (req, res) => {
    //change to req.user.id
    let userId = "5bbff2b462143035e48912f2";
    return Project
        .find({ user: userId })
        .then(projects => res.json(projects))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

//get by project id
router.get('/:id', (req, res) => {
    Project
        .findById(req.params.id)
        .then(project => res.status(201).json(project))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.post('/', (req, res) => {

    const newProject = req.body;
    newProject.created = Date.now();
    // newProject.user = mongoose.Types.ObectId(req.user.id);

    const requiredFields = ['name', 'style', 'created'];
    const missingField = requiredFields.find(field => !(field in newProject));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    Project
        .create({
            _id: new mongoose.Types.ObjectId(),
            user: newProject.user,
            name: newProject.name,
            created: newProject.created,
            size: newProject.size,
            style: newProject.style,
            pattern: newProject.pattern
        })
        .then(project => res.status(201).json(project))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.put('/:id', (req, res) => {

    //how to check subdoc fields? pattern.name
    const updated = {};
    const updateFields = ['name', 'style', 'size'];
    updateFields.forEach(field => {
        if (req.body[field]) {
            updated[field] = req.body[field];
        }
    })

    Project
        .findOneAndUpdate({ _id: req.params.id }, { $set: updated }, { new: true })
        .then(updatedProject => {
            res.status(201).json(updatedProject)
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.delete('/:id', (req, res) => {
    // if (req.params.id !== req.body.id) {
    //     return res.status(422).json({
    //         code: 422,
    //         reason: 'ValidationError',
    //         message: 'The IDs do not match',
    //         location: 'Parameter and Request IDs'
    //     });
    // }

    Project
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(200).json({ message: 'success' })
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error'})
        });
});

module.exports = { router };