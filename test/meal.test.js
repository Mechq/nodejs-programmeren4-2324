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
let createdMealId = ''; // Variable to store the ID of the created meal

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
    it('TC-301-1 Verplicht veld ontbreekt', (done) => {
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

    it('TC-301-2 Niet ingelogd', (done) => {
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

    it('TC-301-3 Maaltijd succesvol toegevoegd', (done) => {
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
                createdMealId = res.body.data.id; // Capture the meal ID
                console.log('Meal created with ID:', createdMealId); // Add this line
                done()

            })
    })
    it('TC-302-1 Maaltijd updaten - niet ingelogd', (done) => {
        chai.request(server)
            .put(`${endpointToTest}/${createdMealId}`)
            .send({
                name: "Updated Meal Name",
                description: "Updated description for meal example",
                price: 12.50
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.have.property('status').equals(401)
                done()
            })
    })

    it('TC-302-2 Maaltijd updaten - succesvol', (done) => {
        console.log('Attempting to update meal with ID:', createdMealId); // Add this line
        chai.request(server)
            .put(`${endpointToTest}/${createdMealId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: "Updated Meal Name",
                description: "Updated description for meal example",
                price: 12.50
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.have.property('status').equals(200)
                done()
            })
    })

    it('TC-302-3 Maaltijd updaten - maaltijd niet gevonden', (done) => {
        const nonExistentMealId = 99999; // Assuming this ID won't exist
        chai.request(server)
            .put(`${endpointToTest}/${nonExistentMealId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: "Updated Meal Name",
                description: "Updated description for meal example",
                price: 12.50
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404) // Or whatever status your API returns for not found
                chai.expect(res.body).to.have.property('status').equals(404)
                done()
            })
    })

    it('TC-303-1 Maaltijd verwijderen - niet ingelogd', (done) => {
        chai.request(server)
            .delete(`${endpointToTest}/${createdMealId}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.have.property('status').equals(401)
                done()
            })
    })

    it('TC-303-2 Maaltijd verwijderen - succesvol', (done) => {
        chai.request(server)
            .delete(`${endpointToTest}/${createdMealId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.have.property('status').equals(200)
                done()
            })
    })



})
