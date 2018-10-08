'use strict';

const { router } = require('./routes');
const { localStrategy, jwtStrategy } = require('./strategies');

module.exports = { router, localStrategy, jwtStrategy };