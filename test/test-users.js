'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;


const { app, runServer, closeServer } = require('../server');
const { User } = require('../users');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

describe('/api/users', function () {
    const firstName = 'Charlie';
    const lastName = 'Kelly';
    const username = 'BirdMan';
    const email = 'charlie@paddyspub.com';
    const password = 'P@ssword1';

    before(function () {
        console.log(TEST_DATABASE_URL)
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
        return closeServer();
    });

    afterEach(function () {
        return User.remove({});
    });

    describe('POST', function () {
        it('Should reject users with a missing field', function () {
            return chai.request(app)
                .post('/api/users')
                .send({
                    firstName,
                    lastName,
                    username,
                    password
                })
                .then((res) => {
                console.log(res)
                expect.fail(null, null, 'Request should not succeed')
                }
                )
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                        throw err;
                    }
                    const res = err.response;
                    expect(res).to.have.status(400);
                    expect(res.body.error).to.equal('Missing \'email\'')
                });
        });
    });

});