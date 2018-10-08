'use strict';

const { User, passwordSchema } = require('./models');
const { router } = require('./routes');

module.exports = { User, passwordSchema, router };