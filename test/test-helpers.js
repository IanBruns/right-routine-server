const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            users_id: 1,
            users_name: 'Test-user-1',
            users_password: 'password',
        },
        {
            id: 2,
            users_name: 'Test-user-2',
            users_password: 'password',
        },
        {
            id: 3,
            users_name: 'Test-user-3',
            users_password: 'password',
        },
    ]
}

function makeRoutinesArray(users) {
    return [
        {
            id: 1,
            routines_name: 'routine-1',
            assigned_user: users[0].id
        },
        {
            id: 2,
            routines_name: 'routine-2',
            assigned_user: users[0].id
        },
        {
            id: 3,
            routines_name: 'routine-3',
            assigned_user: users[1].id
        },
        {
            id: 4,
            routines_name: 'routine-4',
            assigned_user: users[2].id
        },
    ]
}

function makeExercisesArray(routines) {
    return [
        {
            exercises_id: 1,
            exercises_name: 'Exercise-1',
            exercises_description: 'Description-1',
            assigned_routine: routines[0],
        },
        {
            exercises_id: 2,
            exercises_name: 'Exercise-2',
            exercises_description: 'Description-2',
            assigned_routine: routines[1],
        },
        {
            exercises_id: 3,
            exercises_name: 'Exercise-3',
            exercises_description: 'Description-3',
            assigned_routine: routines[1],
        },
        {
            exercises_id: 4,
            exercises_name: 'Exercise-4',
            exercises_description: 'Description-4',
            assigned_routine: routines[0],
        },
        {
            exercises_id: 5,
            exercises_name: 'Exercise-5',
            exercises_description: 'Description-5',
            assigned_routine: routines[0],
        },
    ]
}

module.exports = {
    makeUsersArray,
    makeRoutinesArray,
    makeExercisesArray,
}