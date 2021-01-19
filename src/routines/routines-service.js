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
        return db
            .select('*')
            .from('routines');
    },
    getUserRoutines(db, assigned_user) {
        //assigned_user is the id of the user in the users table
        return db
            .select('*')
            .where({ assigned_user })
            .from('routines');
    },
};

module.exports = RoutinesService;