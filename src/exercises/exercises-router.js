const express = require('express');
const path = require('path');
const ExercisesService = require('./exercises-service');
const { requireAuth } = require('../middleware/api-auth');

const exercisesRouter = express.Router();
const jsonBodyParser = express.json();

exercisesRouter.route('/')
    .get(requireAuth, (req, res, next) => {

    })

module.exports = exercisesRouter;