'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('password-validator');

const projectSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    created: { type: Date, default: Date.now },
    size: { type: String, required: true },
    ease: Number,
    needles: String,
    style: { Type: String, required: true },
    gauge: {
        row: Number,
        stitches: Number
    },
    pattern: {
        name: { type: String, required: true, index: true },
        specs: {
            ease: Number,
            gauge: {
                row: Number,
                stitches: Number
            }
        },
        measurements: {
            chest: mongoose.Schema.Types.Decimal,
            waist: mongoose.Schema.Types.Decimal,
            hips: mongoose.Schema.Types.Decimal,
            upperArm: mongoose.Schema.Types.Decimal,
            armhole: mongoose.Schema.Types.Decimal,
            length: mongoose.Schema.Types.Decimal
        },
        notes: String
    }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };