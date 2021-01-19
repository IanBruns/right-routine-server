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
    .get(requireAuth, (req, res, next) => {
        RoutinesService.getById(req.app.get(req.app.get('db'), req.user.id, req.params.routine_id))
            .then(routine => {
                console.log('then');
                if (!routine) {
                    return res.status(404).json({
                        error: 'Routine not Found'
                    });
                }
            })
            .catch(next);
    });

module.exports = routinesRouter;