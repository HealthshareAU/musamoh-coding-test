const request = require('supertest');
const expect = require('chai').expect;


describe('test server', function () {
    let server;

    beforeEach(function () {
        server = require('./server.js');
    });

    afterEach(function () {
        server.close();
    });

    it('responds to /api/home/', (done) => {
        request(server).get('/api/home/').expect(200, done);
    });

    it('404 other urls', (done) => {
        request(server).get('/should404').expect(404, done);
    });

    it('returns a user', (done) => {
        const user = {
            firstName: 'Jimmy',
            email: 'jimmy@gmail.com',
            password: 'iamnotfondoficecream1234',
            favouriteFruit: 'Apple',
        };
        request(server).get('/api/get-user/2').expect(200).end((err, res) => {
            expect(res.body.user.firstName).to.equal(user.firstName);
            expect(res.body.user.email).to.equal(user.email);
            expect(res.body.user.password).to.equal(user.password);
            expect(res.body.user.favouriteFruit).to.equal(user.favouriteFruit);
            done();
        });
    });

    it('posts a user', (done) => {
        const user = {
            firstName: 'Timmy',
            email: 'Timmy@gmail.com',
            password: 'password123',
            favourite_fruit: 'Banana',
        };
        request(server).post(
            '/api/users/'
        ).type('application/json').send(user).expect(200).end((err, res) => {
            expect(res.body.message).to.equal('User created successfully');
            done();
        });
    });
});
