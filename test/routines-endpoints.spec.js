const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe(`Routines Endpoints`, function () {
    let db;

    const { testUsers, testRoutines, testExercises } = helpers.makeExercisesFixtures();
    const testUser = testUsers[0];
    const testRoutine = testRoutines[0];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
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
                        error: { message: `Routine not found` }
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
                        error: { message: `Routine not found` }
                    });
            });
        });
    });

    describe('POST /api/routines', () => {
        beforeEach('Seed users', () => {
            return helpers.seedUsers(db, testUsers);
        });

        it('returns an error when no routine_name is passed into the database', () => {
            const postRoutineNoName = {
                routine_name: ''
            };

            return supertest(app)
                .post('/api/routines')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(postRoutineNoName)
                .expect(400, {
                    error: { message: `Missing routine_name in request body` }
                });
        });

        it('Returns a 201 and pulls the item in a GET request', () => {
            const postRoutineCorrect = {
                routine_name: 'Test routine_name'
            };

            return supertest(app)
                .post('/api/routines')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(postRoutineCorrect)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id');
                    expect(res.body.routine_name).to.eql(postRoutineCorrect.routine_name);
                    expect(res.body.assigned_user).to.eql(testUser.id);
                })
                .expect(res => {
                    return db
                        .from('routines')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(row.routine_name).to.eql(postRoutineCorrect.routine_name);
                            expect(row.assigned_user).to.eql(testUser.id);
                        });
                });
        });

        it('sanitizes an XSS attack', () => {
            const { maliciousRoutine, expectedRoutine } = helpers.makeMaliciousRoutine(testUser);

            return supertest(app)
                .post('/api/routines')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(maliciousRoutine)
                .expect(201)
                .expect(res => {
                    expect(res.body.routine_name).to.eql(expectedRoutine.routine_name);
                });
        });
    });

    describe(`DELETE /api/routines/:routine_id`, () => {
        context(`Given the item does not exist`, () => {
            beforeEach('Seed Users in the tables', () => {
                return helpers.seedUsers(db, testUsers);
            });

            it(`returns a 404 with the Routine not found`, () => {
                const testId = 1612;

                return supertest(app)
                    .get(`/api/routines/${testId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: `Routine not found` }
                    });
            });
        });

        describe(`Given the item exists in the database`, () => {
            context('If there are no exericses in the database', () => {
                beforeEach('Seed the routines table without Exercises', () => {
                    return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
                });

                it('Returns a 204 and removes the routine from the database', () => {
                    const deleteId = 1;
                    const filteredRoutines = testRoutines.filter(routine => {
                        return (routine.assigned_user == testUser.id
                            && routine.id != deleteId);
                    });

                    return supertest(app)
                        .delete(`/api/routines/${deleteId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get('/api/routines')
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(filteredRoutines)
                        );
                });
            });

            context('If there are exericses in the database', () => {
                beforeEach('Seed the routines table without Exercises', () => {
                    return helpers.seedRoutinesTable(db, testUsers, testRoutines, testExercises);
                });

                it('Returns a 204 and removes the routine from the database', () => {
                    const deleteId = 1;
                    const filteredRoutines = testRoutines.filter(routine => {
                        return (routine.assigned_user == testUser.id
                            && routine.id != deleteId);
                    });

                    return supertest(app)
                        .delete(`/api/routines/${deleteId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(204)
                        .then(res =>
                            supertest(app)
                                .get('/api/routines')
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(filteredRoutines)
                        );
                });
            });
        });
    });

    describe(`PATCH /api/routines/:routine_id`, () => {
        beforeEach('seed the routines table', () => {
            return helpers.seedRoutinesTable(db, testUsers, testRoutines, []);
        });

        it(`sends a 400 with an error when there is no valid name in the request body`, () => {
            const testId = 1;
            const updateRoutineNoName = { routine_name: '' };

            return supertest(app)
                .patch(`/api/routines/${testId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(updateRoutineNoName)
                .expect(400, {
                    error: { message: `routine_name must be in request body` }
                });
        });

        it(`Sends a 404 when the user is trying to update another user's routine`, () => {
            const testId = 4;
            const validUpdateRoutine = { routine_name: 'New Routine name' };

            return supertest(app)
                .patch(`/api/routines/${testId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(validUpdateRoutine)
                .expect(404, {
                    error: { message: `Routine not found` }
                });
        });

        it('sends a 204 and generates with the updated item', () => {
            const testId = 1;
            const updates = { routine_name: 'updated name' };
            expectedRoutine = {
                ...testRoutines[testId - 1],
                ...updates,
            };

            return supertest(app)
                .patch(`/api/routines/${testId}`)
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(updates)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get(`/api/routines/${testId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedRoutine)
                );
        });
    });
});