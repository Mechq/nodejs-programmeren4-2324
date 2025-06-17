const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const tracer = require('tracer');
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../src/util/config').secretkey;
const { expect } = chai;

chai.should();
chai.use(chaiHttp);

tracer.setLevel('warn');

const endpointToTest = '/api/participations';

let authToken = '';
const mealIdForTests = 3;
describe('UC-401 Aanmelden voor maaltijd', () => {
    let authToken;
    before((done) => {
        const payload = {
            userId: '1',
        };

        jwt.sign(payload, jwtSecretKey, {expiresIn: '1h'}, (err, token) => {
            if (err) {
                done(err);
            } else {
                authToken = token;
                done();
            }
        });
    });

    beforeEach((done) => {
        console.log('Before each test');
        done();
    });


    it('TC-401-1 Niet ingelogd - get participations', (done) => {
        chai
            .request(server)
            .get(`${endpointToTest}/${mealIdForTests}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.status).to.equal(401);
                done();
            });
    });

    it('TC-401-2 Maaltijd bestaat niet - get participations', (done) => {
        const nonExistentMealId = 99999;
        chai
            .request(server)
            .get(`${endpointToTest}/${nonExistentMealId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.status).to.equal(404);
                done();
            });
    });

    it('TC-401-3 Succesvol aangemeld voor maaltijd', (done) => {
        chai
            .request(server)
            .post(`${endpointToTest}/${mealIdForTests}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body.status).to.equal(200);
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body).to.have.property('data').that.is.an('object').that.is.empty;
                done();
            });
    });

    it('TC-401-4 Al aangemeld (duplicate entry)', (done) => {
        chai
            .request(server)
            .post(`${endpointToTest}/${mealIdForTests}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(400);
                expect(res.body.status).to.equal(400);
                done();
            });
    });

    it('TC-401-5 Maaltijd bestaat niet - register', (done) => {
        const nonExistentMealId = 99999;
        chai
            .request(server)
            .post(`${endpointToTest}/${nonExistentMealId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(404);
                expect(res.body.status).to.equal(404);
                done();
            });
    });





    it('TC-402-1 Niet ingelogd - signout', (done) => {
        chai
            .request(server)
            .delete(`${endpointToTest}/${mealIdForTests}`)
            .end((err, res) => {
                expect(res).to.have.status(401);
                expect(res.body.status).to.equal(401);
                done();
            });
    });

    it('TC-402-2 Maaltijd bestaat niet - signout', (done) => {
        const nonExistentMealId = 99999;
        chai
            .request(server)
            .delete(`${endpointToTest}/${nonExistentMealId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res.body.status).to.equal(404);
                done();
            });
    });

    it('TC-402-3 Succesvol uitgeschreven', (done) => {
        chai
            .request(server)
            .delete(`${endpointToTest}/${mealIdForTests}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(200);
                expect(res.body.status).to.equal(200);
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body).to.have.property('data').that.is.an('object').that.is.empty;
                done();
            });
    });

    it('TC-402-4 Al uitgeschreven', (done) => {

        chai
            .request(server)
            .delete(`${endpointToTest}/${mealIdForTests}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                if (err) return done(err);
                expect(res).to.have.status(404);
                expect(res.body.status).to.equal(404);
                done();
            });
    });



});
