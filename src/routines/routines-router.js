const express = require('express');
const path = require('path');
const RoutinesService = require('./routines-service');
const { requireAuth } = require('../middleware/api-auth');

const routinesRouter = express.Router();
const jsonBodyParser = express.json();

routinesRouter.route('/')
    .get(requireAuth, (req, res, next) => {
        RoutinesService.getUserRoutines(req.app.get('db'), req.user.id)
            // .then(routines => {
            //     const filteredRoutines = routines.filter(routine => routine.assigned_user == req.user.id);
            //     return filteredRoutines;
            // })
            .then(routines => {
                res.json(routines.map(RoutinesService.serializeRoutine));
            })
            .catch(next);
    });

module.exports = routinesRouter;