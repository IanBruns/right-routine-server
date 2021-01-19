const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only(`Routines Endpoints`, function () {
    let db;

    const { testUsers, testRoutines, } = helpers.makeExercisesFixtures();
    const testUser = testUsers[0];
    const testRoutine = testRoutines[0];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe(`GET /api/routines`, () => {
        context(`When there are no routines in the database`, () => {
            beforeEach('seed users into the database', () => {
                return helpers.seedUsers(db, testUsers);
            });

            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/routines')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context.only('When there are routines in the database for the users', () => {
            beforeEach('Seed users and routines', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
            });

            it('returns a 200 and the list of routines for that user', () => {
                const expectedRoutines = testRoutines.filter(routine => routine.assigned_user == testUser.id);

                return supertest(app)
                    .get('/api/routines')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRoutines);
            });
        });
    });
});