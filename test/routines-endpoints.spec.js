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

        context('When there are routines in the database for the users', () => {
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

    describe('GET /api/routines/:routine_id', () => {
        context('When the routine is not in the database', () => {
            beforeEach('seed users into the database', () => {
                return helpers.seedUsers(db, testUsers);
            });

            it('Returns a 404 and routine not found error', () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/routines/${testId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: `Routine not found`
                    });
            });
        });

        context('When there are routines in the database', () => {
            beforeEach('Seed the Routines table', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
            });

            it('returns 200 and the routine', () => {
                return supertest(app)
                    .get(`/api/routines/${testRoutines[0].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, testRoutine);
            });

            it('returns a 404 when a user tries to access a valid routine_id for another user', () => {
                return supertest(app)
                    .get(`/api/routines/${testRoutines[testRoutines.length - 1].id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: `Routine not found`
                    });
            });
        });
    });

    describe('POST /api/routines/:routine_id', () => {

    });
});