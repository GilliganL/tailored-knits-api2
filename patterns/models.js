'use strict';

const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose, 2);
mongoose.Promise = global.Promise;

const patternSchema = mongoose.Schema({
    name: { type: String, required: true },
    ease: Number,
    gaugeRow: Number,
    gaugeStitches: Number,
    style: { type: String, enum: ['Raglan', 'Set In', 'Yoke'] },
    chest: { type: Float },
    waist: { type: Float },
    hips: { type: Float },
    length: { type: Float },
    armhole: { type: Float },
    upperArm: { type: Float },
    yokeDepth: { type: Float },
    raglanDepth: { type: Float },
    wrist: { type: Float }
});


// patternSchema.pre('save', function(next) {

//     next();
// });

const Pattern = mongoose.model('Pattern', patternSchema);

module.exports = { Pattern };