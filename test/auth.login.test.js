const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const tracer = require('tracer');

chai.should();
chai.use(chaiHttp);
tracer.setLevel('warn');

const endpointToTest = '/api/auth/login';

describe('UC-101 Inloggen', () => {
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    it.skip('TC-101-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                password: 'secret'
            })
            .end((err, res) => {

                chai.expect(res).to.have.status(400);  // Expecting 400 status code
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(400);
                chai.expect(res.body).to.have.property('message').equals('emailAddress should not be empty');

                done();
            });
    });

    it.skip('TC-101-2 Niet-valide wachtwoord', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'm.vandullemen@server.nl',
                password: 12345  // Invalid password format (not a string)
            })
            .end((err, res) => {

                chai.expect(res).to.have.status(400);  // Expecting 400 status code
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(400);
                chai.expect(res.body).to.have.property('message').equals('password should be a string');

                done();
            });
    });

    it.skip('TC-101-3 Gebruiker bestaat niet', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'nonexistent@server.nl',
                password: 'secret'
            })
            .end((err, res) => {

                chai.expect(res).to.have.status(400);  // Expecting 404 status code
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(400);
                chai.expect(res.body).to.have.property('message').equals('User not found or password invalid');

                done();
            });
    });

    it.skip('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .send({
                emailAddress: 'h.tan@server.com',
                password: 'secret'
            })
            .end((err, res) => {

                chai.expect(res).to.have.status(200);  // Expecting 200 status code
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('message').equals('User logged in');
                chai.expect(res.body).to.have.property('data').that.includes.keys('id', 'emailAddress', 'firstName', 'lastName', 'token');

                done();
            });
    });

});