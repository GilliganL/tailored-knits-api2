'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const aws = require('aws-sdk');

const { Project } = require('./models');

const { S3_BUCKET } = require('../config');

aws.config.region = 'us-west-1';

router.get('/sign-s3', (req, res) => {
    const s3 = new aws.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: `project-images/${fileName}`,
        Expires: 600,
        ACL: 'public-read',
        ContentType: fileType
    };

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/project-images/${fileName}`
        };
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

router.get('/', (req, res) => {
    return Project
        .find()
        .populate('pattern')
        .then(projects => res.json(projects))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.get('/:id', (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
        return Project
            .findById(req.params.id)
            .populate('pattern')
            .populate('user')
            .then(project => res.status(200).json(project))
            .catch(err =>
                res.status(500).json({ message: 'Internal server error' })
            )
    }
    let userId = req.user.id;
    return Project
        .find({ user: userId })
        .populate('pattern')
        .populate('user')
        .then(projects => res.status(201).json(projects))
        .catch(err =>
            res.status(500).json({ message: 'Internal server error' })
        )
});

router.post('/', (req, res) => {

    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Project name is required.',
            location: missingField
        });
    }

    const {
        pattern,
        images,
        name,
        size,
        ease,
        needles,
        gaugeRow,
        gaugeStitches,
        notes,
        chest,
        waist,
        hips,
        upperArm,
        armhole,
        yokeDepth,
        raglanDepth,
        length,
        wrist
    } = req.body;
y
    const newProject = {
        user: req.user.id,
        created: Date.now(),
        images,
        pattern,
        name,
        size,
        ease,
        needles,
        gaugeRow,
        gaugeStitches,
        notes,
        chest,
        waist,
        hips,
        upperArm,
        armhole,
        yokeDepth,
        raglanDepth,
        length,
        wrist
    };

    Project
        .create({
            _id: new mongoose.Types.ObjectId(),
            ...newProject
        })
        .then(project => res.status(200).json(project))
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.put('/:id', (req, res) => {

    const updated = {};
    const updateFields = ['name', 'images','style', 'size', 'ease', 'needles', 'gaugeRow', 'gaugeStitches', 'notes', 'chest', 'waist', 'hips', 'upperArm', 'armhole', 'yokeDepth', 'raglanDepth', 'length', 'wrist'];
    updateFields.forEach(field => {
        if (req.body[field]) {
            updated[field] = req.body[field];
        }
    });

    Project
        .findOneAndUpdate({ _id: req.params.id }, { $set: updated }, { new: true })
        .then(updatedProject => {
            res.status(200).json(updatedProject)
        })
        .catch(err => {
            if (err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({ error: 'Internal server error' })
        });
});

router.delete('/:id', (req, res) => {

    Project
        .findByIdAndRemove(req.params.id)
        .then(() => {
            res.status(200).json({ message: 'success' })
        })
        .catch(err => {
            res.status(500).json({ error: 'Internal server error' })
        });
});

module.exports = { router };