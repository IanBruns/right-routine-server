const xss = require('xss');

const RoutinesService = {
    serializeRoutine(routine) {
        return {
            id: routine.id,
            routine_name: xss(routine.routine_name),
            assigned_user: routine.assigned_user
        };
    },
    getAllRoutines(db) {
        return db.select('*').from('routines');
    }
};

module.exports = RoutinesService;