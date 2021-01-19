const express = require('express');
const path = require('path');
const RoutinesService = require('./routines-service');
const { requireAuth } = require('../middleware/api-auth');

const routinesRouter = express.Router();
const jsonBodyParser = express.json();

routinesRouter.route('/')
    .get(requireAuth, (req, res, next) => {
        RoutinesService.getUserRoutines(req.app.get('db'), req.user.id)
            .then(routines => {
                res.json(routines.map(RoutinesService.serializeRoutine));
            })
            .catch(next);
    });

routinesRouter.route('/:routine_id')
    .all(requireAuth)
    .all(checkRoutineExists)
    .get((req, res, next) => {
        return res.status(200).json(res.routine);
    });

async function checkRoutineExists(req, res, next) {
    try {
        const routine = await RoutinesService.getById(req.app.get('db'), req.user.id, parseInt(req.params.routine_id))

        if (!routine)
            return res.status(404).json({
                error: `Routine not found`
            })

        res.routine = routine;
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = routinesRouter;