const express = require('express');
const path = require('path');
const ExercisesService = require('./exercises-service');
const { requireAuth } = require('../middleware/api-auth');

const exercisesRouter = express.Router();
const jsonBodyParser = express.json();

exercisesRouter.route('/:routine_id/exercises')
    .all(requireAuth)
    .get((req, res, next) => {
        ExercisesService.getRoutineExercises(
            req.app.get('db'),
            req.user.id,
            parseInt(req.params.routine_id)
        )
            .then(exercises => {
                return res.json(exercises.map(ExercisesService.serializeExercise));
            })
            .catch(next);
    });

module.exports = exercisesRouter;