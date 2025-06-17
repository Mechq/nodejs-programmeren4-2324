const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../index')
const tracer = require('tracer')
const jwt = require("jsonwebtoken");
const {secretkey: jwtSecretKey} = require("../src/util/config");

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')
let uniqueEmail = '';
const userEndpoint = '/api/user';
const authEndpoint = '/api/auth/login';

let authToken = '';
let createdUserId = null;

describe('UC-201 Registreren en beheren van users', () => {




    it('TC-201-1 Verplicht veld ontbreekt', (done) => {
        chai.request(server)
            .post(userEndpoint)
            .send({
                lastName: 'van Dam',
                emailAddress: 'nn.lastname@domain.com',
                isActive: true,
                password: 'Secret12',
                phoneNumber: '0612345678',
                roles: ['admin', 'user'],
                street: 'Kerkstra 1',
                city: 'Amsterdam',
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect firstName field')
                chai.expect(res.body).to.have.property('data').that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-201-2 Niet-valide email adres', (done) => {
        chai.request(server)
            .post(userEndpoint)
            .send({
                firstName: 'Hendrik',
                lastName: 'van Dam',
                isActive: true,
                password: 'Secret12',
                phoneNumber: '0612345678',
                roles: ['admin', 'user'],
                street: 'Kerkstra 1',
                city: 'Amsterdam',
                emailAddress: 'vakantie%%%server.nl'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect emailAddress field')
                chai.expect(res.body).to.have.property('data').that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-201-3 Niet-valide password', (done) => {
        chai.request(server)
            .post(userEndpoint)
            .send({
                firstName: 'Hendrik',
                lastName: 'van Dam',
                emailAddress: 'nn.lastname@domain.com',
                isActive: true,
                password: '!',
                phoneNumber: '0612345678',
                roles: ['admin', 'user'],
                street: 'Kerkstra 1',
                city: 'Amsterdam'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect password field')
                chai.expect(res.body).to.have.property('data').that.is.a('object').that.is.empty
                done()
            })
    })


    it.skip('TC-201-4 Gebruiker bestaat al', (done) => {
        const uniqueEmail = `testuser.duplicate-${Date.now()}@server.nl`;
        const userData = {
            firstName: 'Duplicate',
            lastName: 'User',
            emailAddress: uniqueEmail,
            password: 'SecurePassword123',
            isActive: true,
            street: 'Some Street 1',
            city: 'Some City',
            phoneNumber: '0611111111',
            roles: ['user']
        };


        chai.request(server)
            .post(userEndpoint)
            .send(userData)
            .end((err, res) => {
                chai.expect(res).to.have.status(201);
                chai.expect(res.body).to.have.property('status').that.equals(201);


                chai.request(server)
                    .post(userEndpoint)
                    .send(userData)
                    .end((err, res) => {
                        chai.expect(res).to.have.status(400);
                        chai.expect(res.body).to.have.property('status').that.equals(400);
                        chai.expect(res.body).to.have.property('message').that.includes('already exists');
                        done();
                    });
            });
    });


    it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        uniqueEmail = `test.user-${Date.now()}@server.nl`;
        const password = 'StrongPassword123';
        chai.request(server)
            .post(userEndpoint)
            .send({
                firstName: 'Test',
                lastName: 'User',
                emailAddress: uniqueEmail,
                password: password,
                isActive: true,
                street: 'Teststraat 1',
                city: 'Teststad',
                phoneNumber: '06 98765432',
                roles: ['user']
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.be.a('object');
                chai.expect(res.body).to.have.property('status').equals(201);
                chai.expect(res.body).to.have.property('data').that.is.a('object');

                const data = res.body.data;
                chai.expect(data).to.have.property('firstName').equals('Test');
                chai.expect(data).to.have.property('lastName').equals('User');
                chai.expect(data).to.have.property('emailAddress').equals(uniqueEmail);
                chai.expect(data).to.have.property('userId');
                createdUserId = data.userId;
                done();
            })
    })


    it('TC-101-4 Gebruiker succesvol ingelogd', (done) => {
        if (!createdUserId) return done(new Error('Previous registration failed, cannot log in.'));


        const registeredEmail = uniqueEmail;
        const registeredPassword = 'StrongPassword123';

        chai.request(server)
            .post(authEndpoint)
            .send({
                emailAddress: registeredEmail,
                password: registeredPassword
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('data').that.is.a('object');
                chai.expect(res.body.data).to.have.property('token').that.is.a('string');
                authToken = res.body.data.token;
                done();
            });
    });


    it('TC-201-6 Gebruiker Succesvol verwijderd (eigen account)', (done) => {
        if (!createdUserId || !authToken) return done(new Error('Previous tests for user creation/login failed.'));

        chai.request(server)
            .delete(`${userEndpoint}/${createdUserId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200); // Expect 200 for successful deletion
                chai.expect(res.body).to.have.property('status').equals(200);
                chai.expect(res.body).to.have.property('message').that.includes('is verwijderd');
                done();
            });
    });


    it('TC-201-7 Verwijderde gebruiker niet meer aanwezig', (done) => {
        if (!createdUserId || !authToken) return done(new Error('Previous tests for user creation/login/delete failed.'));


        chai.request(server)
            .delete(`${userEndpoint}/${createdUserId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(404); // Expect 404 if already deleted
                chai.expect(res.body).to.have.property('status').equals(404);
                chai.expect(res.body).to.have.property('message').that.includes('not found');
                done();
            });
    });

})