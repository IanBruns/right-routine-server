const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only(`Routines Endpoints`, function () {
    let db;

    const { testUsers } = helpers.makeExercisesFixtures();
    const testUser = testUsers[0];

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
            it('returns a 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/routines')
                    .expect(200, []);
            });
        });
    });
});