const xss = require('xss');

const RoutinesService = {
    serializeRoutine(routine) {
        return {
            id: routine.id,
            routine_name: xss(routine.routine_name)
        };
    }
};

module.exports = RoutinesService;