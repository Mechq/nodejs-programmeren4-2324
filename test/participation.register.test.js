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


        it('TC-401-1 Niet ingelogd', (done) => {
            chai
                .request(server)
                .get(`${endpointToTest}/1`)
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body.status).to.equal(401);
                    done();
                });
        });

        it.skip('TC-401-2 Maaltijd bestaat niet', (done) => {
            chai
                .request(server)
                .get(`${endpointToTest}/1000}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body.status).to.equal(404);

                    done();
                });
        });

    it.skip('TC-401-3 Succesvol aangemeld', (done) => {
        chai
            .request(server)
            .get(`${endpointToTest}/1`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .end((err, res) => {
                if (err) {
                    done(err); // Handle any request errors
                    return;
                }

                console.log('Response body:', res.body); // Log the response body for debugging

                expect(res).to.have.status(200);
                expect(res.body.status).to.equal(200);
                expect(res.body).to.have.property('message').that.is.a('string');
                expect(res.body).to.have.property('data').that.is.an('object').that.is.empty;

                done();
            });
    });



});
