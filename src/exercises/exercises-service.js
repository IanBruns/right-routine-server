const xss = require('xss');

const ExercisesService = {
    serializeExercise(exercise) {
        return {
            id: exercise.id,
            exercise_name: xss(exercise.exercise_name),
            exercise_description: xss(exercise.exercise_description),
            assigned_routine: exercise.assigned_routine,
            assigned_user: exercise.assigned_user,
        };
    },
    getRoutineExercises(db, user_id, assigned_routine_id) {
        return db
            .select('*')
            .where({ assigned_user: user_id, assigned_routine: assigned_routine_id })
            .from('exercises');
    },
    getById(db, assigned_user_id, assigned_routine_id, exercise_id) {
        return ExercisesService.getRoutineExercises(db, assigned_user_id, assigned_routine_id)
            .where('id', exercise_id)
            .first();
    },
    addExercise(db, newExercise) {
        return db
            .insert(newExercise)
            .into('exercises')
            .returning('*')
            .then(([exercise]) => exercise)
            .then(exercise => ExercisesService.getById(
                db,
                exercise.assigned_user,
                exercise.assigned_routine,
                exercise.id
            ));
    },
    deleteExercise(db, exercise_id) {
        return db
            .from('exercises')
            .where({ id: exercise_id })
            .delete();
    },
    updateExercise(db, exercise_id, updates) {
        return db
            .from('exercises')
            .where({ id: exercise_id })
            .update(updates);
    }
};

module.exports = ExercisesService;