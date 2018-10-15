'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const patternSchema = mongoose.Schema({
    name: String,
    ease: Number,
    gaugeRow: Number,
    gaugeStitches: Number,
    chest: mongoose.Schema.Types.Decimal,
    waist: mongoose.Schema.Types.Decimal,
    hips: mongoose.Schema.Types.Decimal,
    upperArm: mongoose.Schema.Types.Decimal,
    armhole: mongoose.Schema.Types.Decimal,
    length: mongoose.Schema.Types.Decimal,
    notes: String
});

const projectSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    created: { type: Date, default: Date.now },
    size: String,
    ease: Number,
    needles: String,
    style: { type: String, required: true },
    gaugeRow: Number,
    gaugeStitches: Number,
    pattern: patternSchema
});

projectSchema.pre('find', function(next) {
    this.populate('user');
    next();
})

projectSchema.pre('');

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };