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
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const { routine_name } = req.body;
        const newRoutine = { routine_name };

        if (newRoutine.routine_name == null || newRoutine.routine_name.length < 1) {
            return res.status(400).json({
                error: `Missing routine_name in request body`
            });
        }
    });

routinesRouter.route('/:routine_id')
    .all(requireAuth)
    .get((req, res, next) => {
        RoutinesService.getById(req.app.get('db'), req.user.id, parseInt(req.params.routine_id))
            .then(routine => {
                if (!routine) {
                    return res.status(404).json({
                        error: 'Routine not found'
                    });
                }
                return res.status(200).json(routine);
            })
            .catch(next);
    });

module.exports = routinesRouter;