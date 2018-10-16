'use strict';

const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose, 2);
mongoose.Promise = global.Promise;

const patternSchema = mongoose.Schema({
    name: String,
    ease: Number,
    gaugeRow: Number,
    gaugeStitches: Number,
    style: { type: String, enum: ['raglan', 'set in'] },
    chest: { type: Float },
    waist: { type: Float },
    hips: { type: Float },
    upperArm: { type: Float },
    armhole: { type: Float },
    length: { type: Float }
});


// patternSchema.pre('save', function(next) {

//     next();
// });

const Pattern = mongoose.model('Pattern', patternSchema);

module.exports = { Pattern };