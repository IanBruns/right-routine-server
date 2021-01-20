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
                // for (let i = exercises.length - 1; i > 0; i--) {
                //     let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
                //     [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
                // }
                return res.json(exercises.map(ExercisesService.serializeExercise));
            })
            .catch(next);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { exercise_name, exercise_description } = req.body;
        const newExercise = { exercise_name, exercise_description };

        for (const [key, value] of Object.entries(newExercise))
            if (value == null || value.length < 1)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })

        newExercise.assigned_user = req.user.id;
        newExercise.assigned_routine = parseInt(req.params.routine_id);

        ExercisesService.addRoutine(req.app.get('db'), newRoutine)
            .then(exercise => {
                return res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${exercise.id}`))
                    .json(ExercisesService.serializeExercise(exercise));
            })
            .catch(next);
    })

exercisesRouter.route('/:routine_id/exercises/:exercise_id')
    .all(requireAuth)
    .all(checkValidExercise)
    .get((req, res, next) => {
        return res.json(ExercisesService.serializeExercise(res.exercise));
    });

async function checkValidExercise(req, res, next) {
    try {
        const exercise = await ExercisesService.getById(
            req.app.get('db'),
            req.user.id,
            parseInt(req.params.routine_id),
            parseInt(req.params.exercise_id),
        )

        if (!exercise) {
            return res.status(404).json({
                error: { message: 'Exercise not found' }
            });
        }

        res.exercise = exercise;
        next()
    } catch (error) {
        next(error);
    }
}

module.exports = exercisesRouter;