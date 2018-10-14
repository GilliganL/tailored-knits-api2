'use strict';

const mongoose = require('mongoose');
mongoose.Promise = require('password-validator');

const projectSchema = mongoose.Schema({
    name: { type: String, required: true, index: true },
    pattern: {
        name: { type: String, required },
        size: { type: String, required },
        ease: { type: Number },
        needles: { Type: String },
        style: { Type: String, required },
        gauge: {
            row: { type: Number },
            stitches: { type: Number }
        },
        measurements: {
            chest: { type: Number },
            waist: { type: Number },
            hips: { type: Number },
            upperArm: { type: Number },
            armhole: { type: Number },
            length: { type: Number }
        }
    },
    specs: {
        ease: { type: Number },
        gauge: {
            row: { type: Number },
            stitches: { type: Number }
        }
    },
    notes: { type: String }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };