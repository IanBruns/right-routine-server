const express = require('express');
const path = require('path');
const RoutinesService = require('./routines-service');
const { requireAuth } = require('../middleware/api-auth');

const routinesRouter = express.Router();
const jsonBodyParser = express.json();

routinesRouter.route('/')
    .get(requireAuth, (req, res, next) => {
        console.log(req.user);
        RoutinesService.getAllRoutines(req.app.get('db'))
            .then(routines => {
                res.json(routines.map(RoutinesService.serializeRoutine));
            })
            .catch(next);
    });

module.exports = routinesRouter;