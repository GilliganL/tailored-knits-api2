'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Pattern } = require('./models');

router.get('/', (req, res) => {
    let userId = req.user.id;
    return Pattern
        .find({ user: userId })
        .then(patterns => res.json(patterns))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

//ObjectId.isValid(req.params.id)
router.get('/:id', (req, res) => {
    Pattern
        .findById(req.params.id)
        .then(pattern => res.status(201).json(pattern))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.post('/', (req, res) => {
    const newPattern = req.body;

    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in newPattern));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    Pattern
        .create({
            _id: new mongoose.Types.ObjectId(),
         //   ...newProject
        
            name: newPattern.name,
            ease: newPattern.ease,
            gaugeRow: newPattern.gaugeRow,
            gaugeStitches: newPattern.gaugeStitches
        })
        .then(pattern => res.status(201).json(pattern))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.put('/:id', (req, res) => {

    const updated = {};
    const updateFields = ['name', 'ease', 'gaugeRow', 'gaugeStitches'];
    updateFields.forEach(field => {
        if (req.body[field]) {
            updated[field] = req.body[field];
        }
    });

    Pattern
        .findOneAndUpdate({ _id: req.params.id }, { $set: updated }, { new: true })
        .then(updatedPattern => {
            res.status(201).json(updatedPatter)
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.delete('/:id', (req, res) => {

    Pattern
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(200).json({ message: 'success' })
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error' })
        });
});

module.exports = { router };