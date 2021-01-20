const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only(`Exercises Endpoints`, function () {
    let db;

    const { testUsers, testRoutines, testExercises } = helpers.makeExercisesFixtures();
    const testUser = testUsers[0];
    const testRoutine = testRoutines[0];
    const textExercise = testExercises[0];

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

    describe.only('GET /api/routines/:routines_id/exercises', () => {
        context(`When there are no execercises in the database`, () => {
            beforeEach('Seed with no exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
            });

            it(`returns a 200 and an empty array`, () => {
                const testId = 1;

                return supertest(app)
                    .get(`/api/routines/${testId}/exercises`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context('When there are exercises in the database', () => {
            beforeEach('Seed with exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, testExercises);
            });

            it('return a 200 and the exercises for that routine', () => {
                const testId = 1;
                const expectedRoutines = testExercises.filter(exercise => exercise.assigned_routine == testId)

                return supertest(app)
                    .get(`/api/routines/${testId}/exercises`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRoutines);
            });
        });
    });
});