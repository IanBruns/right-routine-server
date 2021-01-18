const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: 'Test-user-1',
            password: 'password',
        },
        {
            id: 2,
            user_name: 'Test-user-2',
            password: 'password',
        },
        {
            id: 3,
            user_name: 'Test-user-3',
            password: 'password',
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
    ];
}

function makeExercisesArray(routines) {
    return [
        {
            id: 1,
            exercises_name: 'Exercise-1',
            exercises_description: 'Description-1',
            assigned_routine: routines[0],
        },
        {
            id: 2,
            exercises_name: 'Exercise-2',
            exercises_description: 'Description-2',
            assigned_routine: routines[1],
        },
        {
            id: 3,
            exercises_name: 'Exercise-3',
            exercises_description: 'Description-3',
            assigned_routine: routines[1],
        },
        {
            id: 4,
            exercises_name: 'Exercise-4',
            exercises_description: 'Description-4',
            assigned_routine: routines[0],
        },
        {
            id: 5,
            exercises_name: 'Exercise-5',
            exercises_description: 'Description-5',
            assigned_routine: routines[0],
        },
    ];
}

function makeMaliciousRoutine(user) {
    const maliciousRoutine = {
        id: 911,
        routines_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        assigned_user: user.id,
    };
    const expectedRoutine = {
        ...maliciousRoutine,
        routines_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
    };

    return {
        maliciousRoutine,
        expectedRoutine,
    }
}

function makeMaliciousExercise(routine) {
    const maliciousExercise = {
        id: 911,
        exercises_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        exercises_description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        assigned_routine: routine.id,
    };
    const expectedExercise = {
        ...maliciousExercise,
        exercises_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        exercises_description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    };

    return {
        maliciousExercise,
        expectedExercise,
    }
}

function makeExercisesFixtures() {
    const testUsers = makeUsersArray()
    const testRoutines = makeRoutinesArray(testUsers);
    const testExercises = makeExercisesArray(testRoutines)
    return { testUsers, testRoutines, testExercises }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
                exercises,
                routines,
                users
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE exercises_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE routines_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('exercises_id_seq', 0)`),
                    trx.raw(`SELECT setval('routines_id_seq', 0)`),
                    trx.raw(`SELECT setval('users_id_seq', 0)`),
                ])
            )
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 10)
    }))

    return db.into('users').insert(preppedUsers)
        .then(() =>
            db.raw(
                `SELECT setval('users_id_seq', ?)`,
                [users[users.length - 1].id],
            ))
}

module.exports = {
    makeUsersArray,
    makeRoutinesArray,
    makeExercisesArray,
    makeMaliciousRoutine,
    makeMaliciousExercise,
    makeExercisesFixtures,
    cleanTables,
    seedUsers,
}