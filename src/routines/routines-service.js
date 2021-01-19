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
    getUserRoutines(db, assigned_user_id) {
        return db
            .select('*')
            .where({ assigned_user: assigned_user_id })
            .from('routines');
    },
    getById(db, assigned_user_id, routine_id) {
        return RoutinesService.getUserRoutines(db, assigned_user_id)
            .where('id', routine_id)
            .first();
    },
    addRoutine(db, newRoutine) {
        return db
            .insert(newRoutine)
            .into('routines')
            .returning('*')
            .then(([routine]) => routine)
            .then(routine => RoutinesService.getById(db, routine.assigned_user, routine.id));
    },
};

module.exports = RoutinesService;