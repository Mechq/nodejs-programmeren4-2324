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

const endpointToTest = '/api/user';

let authToken = '';

before((done) => {
    const payload = {
        userId: '1',
    };

    jwt.sign(payload, jwtSecretKey, { expiresIn: '1h' }, (err, token) => {
        if (err) {
            done(err);
        } else {
            authToken = token;
            done();
        }
    });
}, 500);

describe('UC-202 Opvragen van overzicht van users', () => {
    beforeEach((done) => {
        console.log('Before each test');
        done();
    });

    /**
     * Hier starten de testcases
     */
    it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
        chai
            .request(server)
            .get(endpointToTest)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equal(200);
                done();
            });
    });

    it.skip('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden.', (done) => {
        chai
            .request(server)
            .get(`${endpointToTest}?type=Ugly}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({})
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.equal(200);
                expect(res.body.data).to.be.an('array');
                expect(res.body.data).to.be.empty;

                done();
            });
    });


});