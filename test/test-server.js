'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

const {app} = require('../server');

chai.use(chaiHttp);

describe('Server.js file', function() {
    it('Should return status 200', function() {
        return chai.request(app)
            .get('/')
            .then(function(res) {
                expect(res).to.have.status(200);
            });
    });
});