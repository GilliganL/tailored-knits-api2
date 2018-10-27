'use strict';

const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose, 2);
mongoose.Promise = global.Promise;

const projectSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pattern: {type: mongoose.Schema.Types.ObjectId, ref: 'Pattern'},
    images: [String],
    name: { type: String, required: true },
    created: { type: Date, default: Date.now },
    size: String,
    ease: Number,
    needles: String,
    gaugeRow: Number,
    gaugeStitches: Number,
    notes: String,
    chest: { type: Float },
    waist: { type: Float },
    hips: { type: Float },
    upperArm: { type: Float },
    armhole: { type: Float },
    yokeDepth: { type: Float },
    raglanDepth: { type: Float },
    length: { type: Float },
    wrist: { type: Float }
});

projectSchema.pre('findById', function(next) {
    this.populate('pattern');
    next();
})

const Project = mongoose.model('Project', projectSchema);

module.exports = { Project };