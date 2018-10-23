'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const { Pattern } = require('./models');

router.get('/', (req, res) => {
    return Pattern
        .find()
        .then(patterns => res.json(patterns))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.get('/:id', (req, res) => {
    
    Pattern
        .findById(req.params.id)
        .then(pattern => res.status(200).json(pattern))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.post('/', (req, res) => {

    const requiredFields = ['name', 'style'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: `Pattern ${missingField}`
        });
    }

    Pattern
        .create({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            style: req.body.style
        })
        .then(pattern => res.status(200).json(pattern))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.put('/:id', (req, res) => {

    const updated = {};
    const updateFields = ['name', 'ease', 'gaugeRow', 'gaugeStitches', 'style', 'chest', 'waist', 'hips', 'upperArm', 'armhole', 'length', 'wrist'];
    updateFields.forEach(field => {
        if (req.body[field]) {
            updated[field] = req.body[field];
        }
    });

    Pattern
        .findOneAndUpdate({ _id: req.params.id }, { $set: updated }, { new: true })
        .then(updatedPattern => {
            res.status(200).json(updatedPattern)
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