'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Project } = require('./models');

router.get('/', (req, res) => {
    return Project
        .find()
        .then(projects => res.json(projects))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.get('/:id', (req, res) => {
    if (ObjectId.isValie(req.params.id)) {
        Project
            .findById(req.params.id)
            .then(project => res.status(201).json(project))
            .catch(err =>
                res.status(500).json({ message: 'Internal server error' })
            )
    } else {
        let userId = req.user.id;
        return Project
            .find({ user: userId })
            .then(projects => res.json(projects))
            .catch(err =>
                res.status(500).json({ message: 'Internal server error' })
            )
    }
});

router.post('/', (req, res) => {

    const requiredFields = ['name', 'style', 'created', 'user'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const {
        pattern,
        name,
        size,
        ease,
        needles,
        gaugeRow,
        gaugeStitches,
        notes,
        chest,
        waist,
        hips,
        upperArm,
        armhole,
        length
    } = req.body;

    const newProject = {
        user: req.user.id,
        created: Date.now(),
        pattern,
        name,
        size,
        ease,
        needles,
        gaugeRow,
        gaugeStitches,
        notes,
        chest,
        waist,
        hips,
        upperArm,
        armhole,
        length
    };

    Project
        .create({
            _id: new mongoose.Types.ObjectId(),
            ...newProject
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
    
    const updated = {};
    const updateFields = ['name', 'style', 'size', 'ease', 'needles', 'gaugeRow', 'gaugeStitches', 'notes', 'chest', 'waist', 'hips', 'upperArm', 'armhole', 'length'];
    updateFields.forEach(field => {
        if (req.body[field]) {
            updated[field] = req.body[field];
        }
    });

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

    Project
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(200).json({ message: 'success' })
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error' })
        });
});

module.exports = { router };