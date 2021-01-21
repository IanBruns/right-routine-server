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

    describe('GET /api/routines/:routines_id/exercises', () => {
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

    describe('POST /:routine_id/exercises/:exercise_id', () => {
        beforeEach('Seed the database with routines', () => {
            return helpers.seedRoutinesTable(db, testUsers, testRoutines, testExercises);
        });

        it('Returns a 201 and pulls the item in a GET request', () => {
            const newExercise = {
                exercise_name: 'Test Exercise',
                exercise_description: 'Test Description',
            };

            return supertest(app)
                .post(`/api/routines/${testRoutineId}/exercises`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newExercise)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.exercise_name).to.eql(newExercise.exercise_name);
                    expect(res.body.exercise_description).to.eql(newExercise.exercise_description);
                    expect(res.body.assigned_user).to.eql(testUser.id);
                    expect(res.body.assigned_routine).to.eql(testRoutine.id);
                })
                .expect(res => {
                    return db
                        .from('exercises')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.exercise_name).to.eql(newExercise.exercise_name);
                            expect(row.exercise_description).to.eql(newExercise.exercise_description);
                            expect(row.assigned_user).to.eql(testUser.id);
                            expect(row.routine).to.eql(testRoutine.id);
                        });
                });
        });

        it('Sanitizes an xss attack', () => {
            const { maliciousExercise, expectedExercise } = helpers.makeMaliciousExercise(testRoutine);

            return supertest(app)
                .post(`/api/routines/${testRoutineId}/exercises`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(maliciousExercise)
                .expect(201)
                .expect(res => {
                    expect(res.body.exercise_name).to.eql(expectedExercise.exercise_name);
                    expect(res.body.exercise_description).to.eql(expectedExercise.exercise_description);
                    expect(res.body.assigned_routine).to.eql(expectedExercise.assigned_routine);
                });
        });

        ['exercise_name', 'exercise_description'].forEach(field => {
            const newExercise = {
                exercise_name: 'Test Exercise',
                exercise_description: 'Test Description',
            };

            it(`Responds with a 400 when the ${field} is missing`, () => {
                delete newExercise[field];

                return supertest(app)
                    .post(`/api/routines/${testRoutineId}/exercises`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newExercise)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    });
            });
        });
    });

    describe('DELETE /:routine_id/exercises/:exercise_id', () => {
        context('When there are no exercises in the database', () => {
            beforeEach('Seed the Routines in the database no exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
            });

            it('Returns a 404 for item not found', () => {
                const testId = 1612;

                return supertest(app)
                    .delete(`/api/routines/${testRoutineId}/exercises/${testId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: 'Exercise not found' }
                    });
            });
        });

        context('When here are exercises in the database', () => {
            beforeEach('Seed tables with routines and exercises', () => {
                return helpers.seedRoutinesTable(db, testUsers, testRoutines, testExercises);
            });

            it('Returns a 404 when trying to delete another users exrcises', () => {
                const testId = 4;

                return supertest(app)
                    .get(`/api/routines/${testRoutineId}/exercises/${testId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: 'Exercise not found' }
                    });
            });

            it('Returns a 204 and the exercise is removed from the tables', () => {
                const deleteId = 2;
                const filteredExercises = testExercises.filter(exercise => {
                    return (exercise.assigned_routine == testRoutine.id
                        && exercise.id != deleteId);
                });

                return supertest(app)
                    .delete(`/api/routines/${testRoutineId}/exercises/${deleteId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/routines/${testRoutineId}/exercises`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(filteredExercises)
                    );
            });
        });
    });

    describe('PATCH /:routine_id/exercises/:exercise_id', () => {

    })
});