const request = require('supertest');
const expect = require('chai').expect;

describe('test server', () => {
    let server;

    beforeEach(() => {
        server = require('./server.js');
    });

    afterEach(() => {
        server.close();
    });

    it('responds to /api/home/', (done) => {
        request(server)
            .get('/api/home/')
            .expect(200, done);
    });

    it('404 other urls', (done) => {
        request(server)
            .get('/should404')
            .expect(404, done);
    });

    it('returns a user', (done) => {
        const user = {
            firstName: 'Jimmy',
            email: 'jimmy@gmail.com',
            password: 'iamnotfondoficecream1234',
        };
        request(server)
            .get('/api/get-user/2')
            .expect(200)
            .end((err, res) => {
                expect(res.body.user.firstName).to.equal(user.firstName);
                expect(res.body.user.email).to.equal(user.email);
                expect(res.body.user.password).to.equal(user.password);
                done();
            });
    });

    it('does not return user if user does not exist', (done) => {
        request(server)
            .get('/api/get-user/5')
            .expect(200)
            .end((err, res) => {
                expect(Object.keys(res.body).length).to.equal(0);
                done();
            });
    });

    it('posts a user', (done) => {
        const user = {
            first_name: 'Timmy',
            email: 'Timmy@gmail.com',
            password: 'password123',
        };
        request(server)
            .post('/api/users/')
            .type('application/json')
            .send(user)
            .expect(200)
            .end((err, res) => {
                expect(res.body.message).to.equal('User created successfully');
                done();
            });
    });
});
