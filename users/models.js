'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passwordValidator = require('password-validator');
const Float = require('mongoose-float').loadType(mongoose, 2);
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    username: { type: String, minLength: 3, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    chest: { type: Float },
    waist: { type: Float },
    hips: { type: Float },
    upperArm: { type: Float },
    armhole: { type: Float },
    length: { type: Float },
    wrist: { type: Float }
});

const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(8)
    .is().max(72)
    .has().uppercase()
    .has().lowercase()
    .has().digits()

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.methods.serialize = function () {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        username: this.username,
        chest: this.chest,
        waist: this.waist,
        hips: this.hips,
        upperArm: this.upperArm,
        armhole: this.armhole,
        length: this.length,
        wrist: this.wrist
    };
};

userSchema.methods.validatePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function (password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = { User, passwordSchema };