const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            users_id: 1,
            user_name: 'Test-user-1',
            user_password: 'password',
        },
        {
            id: 2,
            user_name: 'Test-user-2',
            user_password: 'password',
        },
        {
            id: 3,
            user_name: 'Test-user-3',
            user_password: 'password',
        },
    ]
}

function makeRoutinesArray() {
    return [
        {
            id: 1,
            routine_name:
        }
    ]
}

module.exports = {
    makeUsersArray,
}