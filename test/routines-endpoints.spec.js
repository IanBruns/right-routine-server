const knex = require('knex');
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

    describe.only(`GET /api/routines`, () => {
        context(`When there are no routines in the database`, () => {
            before('seed users into the database', () => {
                helpers.seedUsers(db, testUsers);
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
                helpers.seedRoutinesTable(db, testUsers, testRoutines);
            });
        });
    });
});