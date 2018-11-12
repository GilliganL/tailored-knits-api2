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

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

function seedUserData() {
    console.info('Seeding user data');
    const seedData = [];
    for (let i = 0; i <= 10; i++) {
        seedData.push(generateUserData());
    }
    return User.insertMany(seedData);
}

function generateUserData() {
    return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.name.lastName(),
        email: faker.internet.email(),
        password: 'P@ssw0rd',
        chest: faker.random.number(),
        waist: faker.random.number(),
        hips: faker.random.number(),
        upperArm: faker.random.number(),
        armhole: faker.random.number(),
        length: faker.random.number(),
        wrist: faker.random.number()
    };
}

const username = 'elizabeth';
const password = 'P@ssw)rd';
const firstName = 'Elizabeth';
const lastName = 'Bennett';
const email = 'eliza@fake.com';
const chest = 34;
const waist = 27;
const hips = 35;
const upperArm = 12;
const armhole = 8;
const length = 15;
const wrist = 7;
let userId;
let token;

describe('User API endpoints', function () {

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedUserData()
            .then(() => User.hashPassword(password))
            .then(password =>
                User.create({
                    username,
                    password,
                    firstName,
                    lastName,
                    email,
                    chest,
                    hips,
                    waist,
                    length,
                    armhole,
                    wrist,
                    upperArm
                })
            )
            .then((user) => {
                userId = user._id;
                token = jwt.sign({
                    user: {
                        username,
                        firstName,
                        lastName,
                        id: user._id
                    }
                },
                    JWT_SECRET,
                    {
                        algorithm: 'HS256',
                        subject: username,
                        expiresIn: '7d'
                    })
            });
    });

    afterEach(function () {
        return tearDownDb()
    });


    after(function () {
        return closeServer();
    });

    describe('GET endpoint', function () {
        it('should return all existing users', function () {
            let res;
            return chai.request(app)
                .get('/api/users')
                .set('authorization', `Bearer ${token}`)
                .then(function (_res) {
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.lengthOf.at.least(1);
                    return User.count();
                })
                .then(function (count) {
                    expect(res.body).to.have.lengthOf(count);
                });
        });

        it('Should return users with the correct fields', function () {
            let resUser;
            return chai.request(app)
                .get('/api/users')
                .set('authorization', `Bearer ${token}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);

                    res.body.forEach(function (user) {
                        expect(user).to.be.a('object');
                        expect(user).to.include.keys(
                            'id',
                            'username',
                            'firstName',
                            'lastName',
                            'email',
                            'chest',
                            'waist',
                            'hips',
                            'upperArm',
                            'armhole',
                            'length',
                            'wrist');
                    })
                    resUser = res.body[0];
                    return User.findById(resUser.id);
                })
                .then(function (user) {
                    user = user.serialize();
                    expect(resUser.id).to.equal(user.id.toString());
                    expect(resUser.firstName).to.equal(user.firstName);
                    expect(resUser.lastName).to.equal(user.lastName);
                    expect(resUser.email).to.equal(user.email);
                    expect(resUser.chest).to.equal(user.chest);
                    expect(resUser.waist).to.equal(user.waist);
                    expect(resUser.hips).to.equal(user.hips);
                    expect(resUser.upperArm).to.equal(user.upperArm);
                    expect(resUser.armhole).to.equal(user.armhole);
                    expect(resUser.length).to.equal(user.length);
                    expect(resUser.wrist).to.equal(user.wrist);
                });
        });

        it('Should return user with matching id', function () {
            let resUser;
            return chai.request(app)
                .get(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.id).to.equal(userId.toString());
                    resUser = res.body;
                    return User.findById(resUser.id);
                })
                .then(function (user) {
                    user = user.serialize();
                    expect(resUser.id).to.equal(user.id.toString());
                    expect(resUser.firstName).to.equal(user.firstName);
                    expect(resUser.lastName).to.equal(user.lastName);
                    expect(resUser.email).to.equal(user.email);
                    expect(resUser.chest).to.equal(user.chest);
                    expect(resUser.waist).to.equal(user.waist);
                    expect(resUser.hips).to.equal(user.hips);
                    expect(resUser.upperArm).to.equal(user.upperArm);
                    expect(resUser.armhole).to.equal(user.armhole);
                    expect(resUser.length).to.equal(user.length);
                    expect(resUser.wrist).to.equal(user.wrist);
                });
        });

        it('Should return an error when the user ID does not exist', function () {
            return chai.request(app)
                .get('/api/users/132465798')
                .set('Authorization', `Bearer ${token}`)
                .then(function (res) {
                    expect(res).to.have.status(500);
                });
        });
    });

    describe('POST API endpoint', function () {

        // describe('POST', function () {
        //     it('Should reject users with a missing field', function () {
        //         return chai.request(app)
        //             .post('/api/users')
        //             .send({
        //                 firstName,
        //                 lastName,
        //                 username,
        //                 password
        //             })
        //             .then((res) => {
        //                 //should not execute
        //                 expect.fail(null, null, 'Request should not succeed')
        //             }
        //             )
        //             .catch(err => {
        //                 if (err instanceof chai.AssertionError) {
        //                     throw err;
        //                 }
        //                 const res = err.response;
        //                 expect(res).to.have.status(400);
        //                 expect(res.body.error).to.equal('Missing \'email\'')
        //             });
        //     });
        // });

        it('Should add a new user', function () {
            const newUser = generateUserData();
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    newUser.id = res.body.id;
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.keys(
                        'firstName', 'lastName', 'username', 'email', 'id');
                    expect(res.body.firstName).to.equal(newUser.firstName);
                    expect(res.body.lastName).to.equal(newUser.lastName);
                    expect(res.body.username).to.equal(newUser.username);
                    expect(res.body.email).to.equal(newUser.email);
                    return User.findById(res.body.id);
                })
                .then(function (user) {
                    expect(newUser.id).to.equal(user.id.toString());
                    expect(newUser.firstName).to.equal(user.firstName);
                    expect(newUser.lastName).to.equal(user.lastName);
                    expect(newUser.email).to.equal(user.email);
                });
        });

        it('Should reject if a field is missing', function () {
            const newUser = generateUserData();
            delete newUser.firstName;
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Missing field');
                    expect(res.body.location).to.equal('firstName');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });

        it('Should reject if name field contains non-alpha characters', function () {
            const newUser = generateUserData();
            newUser.username = 'uniqueusername';
            newUser.firstName = 'Jane1';
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Incorrect field type: only letters allowed');
                    expect(res.body.location).to.equal('firstName');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });

        it('Should reject if trimmed field starts with a space', function () {
            const newUser = generateUserData();
            newUser.username = ' testUser';
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Cannot start or end with a space');
                    expect(res.body.location).to.equal('username');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });

        it('Should reject if email is invalid format', function () {
            const newUser = generateUserData();
            newUser.email = ' test.test.com';
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Not a valid email address');
                    expect(res.body.location).to.equal('Email');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });

        it('Should reject if password does not meet requirements', function () {
            const newUser = generateUserData();
            newUser.password = 'passw1';
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.be.a('array');
                    expect(res.body.message[0]).to.equal('min');
                    expect(res.body.message[1]).to.equal('uppercase');
                    expect(res.body.location).to.equal('Password');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });

        it('Should fail if username is already taken', function () {
            let newUser = generateUserData();
            User.create(newUser);    
            return chai.request(app)
                .post('/api/users')
                .send(newUser)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Username already taken');
                    expect(res.body.location).to.equal('username');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
    });

    describe('PUT API endpoint', function() {
        it('should update fields', function () {
            const updateData = {
                firstName: 'Fitzwilliam',
                lastName: 'Darcy',
                email: 'darcy@fake.com',
                chest: 40,
                waist: 37,
                hips: 35,
                upperArm: 15,
                armhole: 9.5,
                length: 17,
                wrist: 10
            }

            return chai.request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .then(function(res) {
                    expect(res).to.have.status(200);
                    return User.findById(userId);
                })
                .then(function (user) {
                    expect(updateData.firstName).to.equal(user.firstName);
                    expect(updateData.lastName).to.equal(user.lastName);
                    expect(updateData.email).to.equal(user.email);
                    expect(updateData.chest).to.equal(user.chest);
                    expect(updateData.waist).to.equal(user.waist);
                    expect(updateData.hips).to.equal(user.hips);
                    expect(updateData.upperArm).to.equal(user.upperArm);
                    expect(updateData.armhole).to.equal(user.armhole);
                    expect(updateData.length).to.equal(user.length);
                    expect(updateData.wrist).to.equal(user.wrist);
                });
        });

        it('Should reject if name field contains non-alpha characters', function () {
            const updateData = {
                firstName: 'Fitzwi11iam'
            }
            return chai.request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Incorrect field type: only letters allowed');
                    expect(res.body.location).to.equal('firstName');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });

        it('Should reject if email is invalid format', function () {
            const updateData = {
                email: 'notAnEmail.com'
            }
            return chai.request(app)
                .put(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .then(function (res) {
                    expect(res).to.have.status(422);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('Not a valid email address');
                    expect(res.body.location).to.equal('email');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
    });

    describe('DELETE API endpoint', function () {
        it('Should delete the user by ID', function () {
            return chai.request(app)
                .delete(`/api/users/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body.message).to.equal('success');
                    return User.findById(userId);
                })
                .then(function(res) {
                    expect(res).to.be.null;
                });
        });
    });  
});