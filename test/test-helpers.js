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

module.exports = {
    makeUsersArray,
    makeRoutinesArray,
}