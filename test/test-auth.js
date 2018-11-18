'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const expect = chai.expect;

const { app, runServer, closeServer } = require('../server');
const { User } = require('../users/models');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

chai.use(chaiHttp);

describe('auth API resource', function () {
    const username = 'dennis';
    const password = 'Password123!';
    const firstName = 'Dennis';
    const lastName = 'Reynolds';
    const email = 'test@test.com';
    let token;


    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return User
            .hashPassword(password)
            .then(password =>
                User.create({
                    username,
                    password,
                    firstName,
                    lastName,
                    email
                })
            )
    });

    afterEach(function () {
        return User.remove({});
    });

    after(function () {
        return closeServer();
    });

    describe('Login enpoint', function () {
        it('Should reject with no credentials', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .then((res) => {
                    expect(res).to.have.status(400);
                });
        });

        it('Should reject an incorrect username', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .send({ username: 'fakeusername', password })
                .then((res) => {
                    expect(res).to.have.status(401);
                });
        });

        it('Should reject an incorrect password', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .send({ username, password: '12341345' })
                .then((res) => {
                    expect(res).to.have.status(401);
                });
        });

        it('Should return a valid token', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .send({ username, password })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object')
                    token = res.body.authToken;
                    expect(token).to.be.a('string');
                    let payload = jwt.verify(token, JWT_SECRET, {
                        algorithm: ['HS256']
                    });
                    expect(payload.user.username).to.equal(username);
                    expect(payload.user.firstName).to.equal(firstName);
                    expect(payload.user.lastName).to.equal(lastName);
                    expect(payload.user.email).to.equal(email);
                });

        });
    });

    describe('Refresh endpoint', function () {
        it('Should return a new auth Token', function () {
            return chai.request(app)
                .post('/api/auth/refresh')
                .set('Authorization', `Bearer ${token}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    let newToken = res.body.authToken;
                    expect(newToken).to.be.a('string');
                    let payload = jwt.verify(newToken, JWT_SECRET, {
                        algorithm: ['HS256']
                    });
                    expect(payload.user.username).to.equal(username);
                    expect(payload.user.firstName).to.equal(firstName);
                    expect(payload.user.lastName).to.equal(lastName);
                    expect(payload.user.email).to.equal(email);
                });
        });
    });

    describe('Logout endpoint', function () {
        it('should log the user out', function () {
            return chai.request(app)
                .get('/api/auth/logout')
                .then(function (res) {
                    expect(res).to.have.status(200);
                });
        });
    });
});