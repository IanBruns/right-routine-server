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
                return res.json(routines.map(RoutinesService.serializeRoutine));
            })
            .catch(next);
    })
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
        const { routine_name } = req.body;
        const newRoutine = { routine_name };

        if (newRoutine.routine_name == null || newRoutine.routine_name.length < 1) {
            return res.status(400).json({
                error: { message: `Missing routine_name in request body` }
            });
        }
        newRoutine.assigned_user = req.user.id;

        routine = await RoutinesService.addRoutine(req.app.get('db'), newRoutine)
        return res.status(201)
            .location(path.posix.join(req.originalUrl, `/${routine.id}`))
            .json(RoutinesService.serializeRoutine(routine));
    });

routinesRouter.route('/:routine_id')
    .all(requireAuth)
    .all(checkValidRoutine)
    .get((req, res, next) => {
        return res.status(200).json(RoutinesService.serializeRoutine(res.routine));
    })
    .delete(async (req, res, next) => {
        await RoutinesService.deleteRoutine(req.app.get('db'), res.routine.id)
        return res.status(204).end();
    })

async function checkValidRoutine(req, res, next) {
    try {
        const routine = await RoutinesService.getById(
            req.app.get('db'),
            req.user.id,
            parseInt(req.params.routine_id)
        )

        if (!routine) {
            return res.status(404).json({
                error: { message: 'Routine not found' }
            });
        }

        res.routine = routine;
        next()
    } catch (error) {
        next(error);
    }
}

module.exports = routinesRouter;