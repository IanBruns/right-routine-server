const xss = require('xss');

const ExercisesServices = {
    serializeRoutine(exercise) {
        return {
            id: exercise.id,
            exercise_name: xss(exercise.exercise_name),
            exercise_description: xss(exercise.exercise_description),
            assigned_routine: exercise.assigned_routine
        };
    },
};

module.exports = ExercisesServices;