const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const jwt = require("jsonwebtoken");
const {secretkey: jwtSecretKey} = require("../src/util/config");

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/meal'

let authToken = '';

describe('UC-301 Toevoegen van maaltijd', () => {
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


    /**
     * Hier starten de testcases
     */
    it.skip('TC-301-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                isVega: 1,
                isVegan: 1,
                isToTakeHome: 1,
                maxAmountOfParticipants: 10,
                price: 99.99,
                imageUrl: "mealExample.jpg",
                // name: "mealExample", verplicht veld ontbreekt
                description: "meal example beschrijving",
                allergens: "noten"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.have.property('status').equals(400)
                done()
            })
    })

    it.skip('TC-301-2 Niet ingelogd', (done) => {
        chai.request(server)
            .post(endpointToTest)

            .send({
                isVega: 1,
                isVegan: 1,
                isToTakeHome: 1,
                maxAmountOfParticipants: 10,
                price: 99.99,
                imageUrl: "mealExample.jpg",
                name: "mealExample",
                description: "meal example beschrijving",
                allergens: "noten"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.have.property('status').equals(401)
                done()
            })
    })

    it.skip('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
        chai.request(server)
            .post(endpointToTest)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                isVega: 1,
                isVegan: 1,
                isToTakeHome: 1,
                maxAmountOfParticipants: 10,
                price: 99.99,
                imageUrl: "mealExample.jpg",
                name: "mealExample",
                description: "meal example beschrijving",
                allergenes: "noten"
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.have.property('status').equals(200)
                done()
            })
    })
})
