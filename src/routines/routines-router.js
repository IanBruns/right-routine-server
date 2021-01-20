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
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { routine_name } = req.body;
        const newRoutine = { routine_name };

        if (newRoutine.routine_name == null || newRoutine.routine_name.length < 1) {
            return res.status(400).json({
                error: { message: `Missing routine_name in request body` }
            });
        }
        newRoutine.assigned_user = req.user.id;

        RoutinesService.addRoutine(req.app.get('db'), newRoutine)
            .then(routine => {
                return res.status(201)
                    .location(path.posix.join(req.originalUrl, `/${routine.id}`))
                    .json(RoutinesService.serializeRoutine(routine));
            })
            .catch(next);
    });

routinesRouter.route('/:routine_id')
    .all(requireAuth)
    .all(checkValidRoutine)
    .get((req, res, next) => {
        return res.status(200).json(RoutinesService.serializeRoutine(res.routine));
    })
    .delete((req, res, next) => {
        RoutinesService.deleteRoutine(req.app.get('db'), res.routine.id)
            .then(numRowsAffected => {
                return res.status(204).end();
            })
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const { routine_name } = req.body;
        const fieldsToUpdate = { routine_name };

        if (!fieldsToUpdate || fieldsToUpdate.routine_name.length < 1) {
            return res.status(400).json({
                error: { message: `routine_name must be in request body` }
            })
        }

        RoutinesService.updateRoutine(req.app.get('db'), res.routine.id, fieldsToUpdate)
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch();
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