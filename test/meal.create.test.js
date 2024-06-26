const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

const endpointToTest = '/api/meal'

describe('UC-301 Toevoegen van maaltijd', () => {
    /**
     * Voorbeeld van een beforeEach functie.
     * Hiermee kun je code hergebruiken of initialiseren.
     */
    beforeEach((done) => {
        console.log('Before each test')
        done()
    })

    /**
     * Hier starten de testcases
     */
    // it('TC-201-1 Verplicht veld ontbreekt', (done) => {
    //     chai.request(server)
    //         .post(endpointToTest)
    //         .send({
    //             // firstName: 'Hendrik', ontbreekt
    //             // firstName: '1',
    //             lastName: 'van Dam',
    //             emailAddress: 'n.lastname@domain.com',
    //             isActive: true,
    //             password: 'Secret12',
    //             phoneNumber: '0612345678',
    //             roles: ['admin', 'user'],
    //             street: 'Kerkstra 1',
    //             city: 'Amsterdam',
    //         })
    //         .end((err, res) => {
    //             /**
    //              * Voorbeeld uitwerking met chai.expect
    //              */
    //             chai.expect(res).to.have.status(400)
    //             chai.expect(res).not.to.have.status(200)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(400)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('Missing or incorrect firstName field')
    //             chai
    //                 .expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object').that.is.empty
    //
    //             done()
    //         })
    // })
    //
    // it('TC-201-2 Niet-valide email adres', (done) => {
    //     chai.request(server)
    //         .post(endpointToTest)
    //         .send({
    //             firstName: 'Hendrik',
    //             lastName: 'van Dam',
    //             isActive: true,
    //             password: 'Secret12',
    //             phoneNumber: '0612345678',
    //             roles: ['admin', 'user'],
    //             street: 'Kerkstra 1',
    //             city: 'Amsterdam',
    //             emailAddress: 'vakantie%%%server.nl' // invalide mailadres
    //         })
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(400)
    //             chai.expect(res).not.to.have.status(200)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(400)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('Missing or incorrect emailAddress field')
    //             chai
    //                 .expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object').that.is.empty
    //
    //             done()
    //         })
    // })
    //
    // it('TC-201-3 Niet-valide password', (done) => {
    //     chai.request(server)
    //         .post(endpointToTest)
    //         .send({
    //             firstName: 'Hendrik',
    //             lastName: 'van Dam',
    //             emailAddress: 'n.lastname@domain.com',
    //             isActive: true,
    //             password: '!',
    //             phoneNumber: '0612345678',
    //             roles: ['admin', 'user'],
    //             street: 'Kerkstra 1',
    //             city: 'Amsterdam'
    //         })
    //         .end((err, res) => {
    //             chai.expect(res).to.have.status(400)
    //             chai.expect(res).not.to.have.status(200)
    //             chai.expect(res.body).to.be.a('object')
    //             chai.expect(res.body).to.have.property('status').equals(400)
    //             chai.expect(res.body)
    //                 .to.have.property('message')
    //                 .equals('Missing or incorrect password field')
    //             chai
    //                 .expect(res.body)
    //                 .to.have.property('data')
    //                 .that.is.a('object').that.is.empty
    //
    //             done()
    //         })
    // })
    // it.skip('TC-201-4 Gebruiker bestaat al', (done) => {
    //     // Define user data for the first user
    //     const userData1 = {
    //         firstName: 'Swdsdftef',
    //         lastName: 'Resdfsdfnsma',
    //         emailAddress: 's.adsdaaka@avans.com',
    //         password: 'SecurePass123',
    //         isActive: true,
    //         street: 'San212delhout 12129',
    //         city: 'Barendraaasdfaecht',
    //         phoneNumber: '06 38765716',
    //         roles: ['guest']
    //     };
    //
    //     // First POST request to create the first user
    //     chai.request(server)
    //         .post(endpointToTest)
    //         .send(userData1)
    //         .end((err, res) => {
    //             // Assert the response of the first request
    //             chai.expect(res).to.have.status(400); // Expecting a 201 status code for successful creation
    //             chai.expect(res.body).to.be.a('object');
    //             chai.expect(res.body).to.have.property('status').that.equals(400);
    //
    //             // Attempt to create the second user with the same email address
    //             chai.request(server)
    //                 .post(endpointToTest)
    //                 .send(userData1) // Same email address as userData1
    //                 .end((err, res) => {
    //                     // Assert the response of the second request
    //                     chai.expect(res).to.have.status(400); // Expecting a 400 status code for duplicate user
    //                     chai.expect(res.body).to.be.a('object');
    //                     chai.expect(res.body).to.have.property('status').that.equals(400);
    //                     chai.expect(res.body).to.have.property('message').that.includes('already exists'); // Check for specific error message
    //
    //                     done();
    //                 });
    //         });
    // });
    //
    // it.skip('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
    //     chai.request(server)
    //         .post(endpointToTest)
    //         .send({
    //             firstName: 'Voornaam',
    //             lastName: 'Achternaam',
    //             emailAddress: 'v.test3@server.nl',
    //             password: 'Secret123',
    //             isActive: true,
    //             street: 'AvansExample 12129',
    //             city: 'Breda',
    //             phoneNumber: '06 12345678',
    //             roles: ['admin']
    //         })
    //         .end((err, res) => {
    //             res.should.have.status(201);
    //             res.body.should.be.a('object');
    //
    //             // Check for the presence of 'data' object
    //             res.body.should.have.property('data').that.is.a('object');
    //
    //             // Check individual properties in 'data'
    //             const data = res.body.data;
    //             data.should.have.property('firstName').equals('Voornaam');
    //             data.should.have.property('lastName').equals('Achternaam');
    //             data.should.have.property('emailAddress').equals('v.test@server.nl');
    //             data.should.have.property('id').that.is.a('number');
    //
    //             // Optionally, check other properties as needed
    //             done()
    //         })
    // })
})
