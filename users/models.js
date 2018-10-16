'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passwordValidator = require('password-validator');
mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    firstName: { type: String, required: true, index: true },
    lastName: { type: String, required: true, index: true },
    username: { type: String, minLength: 3, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    chest: mongoose.Schema.Types.Decimal,
    waist: mongoose.Schema.Types.Decimal,
    hips: mongoose.Schema.Types.Decimal,
    upperArm: mongoose.Schema.Types.Decimal,
    armhole: mongoose.Schema.Types.Decimal,
    length: mongoose.Schema.Types.Decimal,
});

const passwordSchema = new passwordValidator();

passwordSchema
    .is().min(8)
    .is().max(72)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().not().spaces()

userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.methods.serialize = function() {
    return {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        username: this.username
    };
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

module.exports = { User, passwordSchema };