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
    const testExercise = testExercises[0];
    const testRoutineId = 1;

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

                return supertest(app)
                    .get(`/api/routines/${testRoutineId}/exercises`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context('When there are exercises in the database', () => {
            beforeEach('Seed with exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, testExercises);
            });

            it('return a 200 and the exercises for that routine', () => {
                const expectedRoutines = testExercises.filter(exercise =>
                    exercise.assigned_routine == testRoutineId);

                return supertest(app)
                    .get(`/api/routines/${testRoutineId}/exercises`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, expectedRoutines);
            });
        });
    });

    describe('GET /api/routines/:routines_id/exercises/:exercises_id', () => {
        context(`When the item doesn't exist`, () => {
            beforeEach('Seed the table with no exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
            });

            it(`Returns a 404 for exercise not found`, () => {
                const testInvalidExerciseId = 1612;

                return supertest(app)
                    .get(`/api/routines/${testRoutineId}/exercises/${testInvalidExerciseId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: 'Exercise not found' }
                    });
            });
        });

        context('When the item exists', () => {
            beforeEach('Seed routines with exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, testExercises);
            });

            it(`Returns a 200 and the requested exercise`, () => {
                const testValidExerciseId = testExercise.id;

                return supertest(app)
                    .get(`/api/routines/${testRoutineId}/exercises/${testValidExerciseId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, testExercise);
            });

            it(`returns a 404 when trying to access another user's exercise`, () => {
                const testValidExerciseOtherUser = 3;

                return supertest(app)
                    .get(`/api/routines/${testRoutineId}/exercises/${testValidExerciseOtherUser}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: 'Exercise not found' }
                    });
            });
        });
    });
});