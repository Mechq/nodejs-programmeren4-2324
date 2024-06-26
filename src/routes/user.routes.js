const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const validateToken = require('./authentication.routes').validateToken
const userController = require('../controllers/user.controller')
const logger = require('../util/logger')

// Tijdelijke functie om niet bestaande routes op te vangen
const notFound = (req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    })
}


const validateUserIdChaiExpect = (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        assert(userId, 'Missing or incorrect number field');
        chai.expect(userId).to.not.be.NaN;
        chai.expect(userId).to.be.a('number')
        logger.trace('User successfully validated');
        next();
    } catch (ex) {
        logger.trace('User validation failed:', ex.message);
        next({
            status: 400,
            message: ex.message,
            data: {}
        });
    }
};
const validateUserCreate = (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            emailAddress,
            password,
            street,
            city,
            phoneNumber,
            roles,
        } = req.body;

        assert.ok(firstName, 'Missing or incorrect firstName field');
        assert.strictEqual(typeof firstName, 'string', 'Missing or incorrect firstName field');

        assert.ok(lastName, 'Missing or incorrect lastName field');
        assert.strictEqual(typeof lastName, 'string', 'Missing or incorrect lastName field');

        assert.ok(emailAddress, 'Missing or incorrect emailAddress field');
        assert.strictEqual(typeof emailAddress, 'string', 'Missing or incorrect emailAddress field');
        assert.ok(
            /^[a-zA-Z][.][a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(emailAddress),
            'Missing or incorrect emailAddress field'
        );

        assert.ok(password, 'Missing or incorrect password field');
        assert.strictEqual(typeof password, 'string', 'Missing or incorrect password field');
        assert.ok(
            /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password),
            'Missing or incorrect password field'
        );

        assert.ok(street, 'Missing or incorrect street field');
        assert.strictEqual(typeof street, 'string', 'Missing or incorrect street field');

        assert.ok(city, 'Missing or incorrect city field');
        assert.strictEqual(typeof city, 'string', 'Missing or incorrect city field');

        assert.ok(phoneNumber, 'Missing or incorrect phoneNumber field');
        assert.strictEqual(typeof phoneNumber, 'string', 'Missing or incorrect phoneNumber field');
        assert.ok(
            /^06[-\s]?\d{8}$/.test(phoneNumber),
            'Missing or incorrect phoneNumber field'
        );

        assert.ok(roles, 'Missing or incorrect roles field');
        assert.ok(Array.isArray(roles), 'roles should be an array');

        next();
    } catch (err) {
        return res.status(400).json({
            status: 400,
            message: err.message,
            error: err.toString(),
            data: {},
        });
    }
};

// Validation for updating a user
const validateUserUpdate = (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            emailAddress,
            password,
            isActive,
            street,
            city,
            phoneNumber,
            roles,
        } = req.body;

        assert.ok(emailAddress, 'Missing or incorrect emailAddress field');
        assert.strictEqual(typeof emailAddress, 'string', 'emailAddress should be a string');
        assert.ok(
            /^[a-zA-Z][.][a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(emailAddress),
            'emailAddress should match the pattern'
        );

        if (firstName !== undefined) {
            assert.strictEqual(typeof firstName, 'string', 'firstName should be a string');
        }

        if (lastName !== undefined) {
            assert.strictEqual(typeof lastName, 'string', 'lastName should be a string');
        }

        if (password !== undefined) {
            assert.strictEqual(typeof password, 'string', 'password should be a string');
            assert.ok(
                /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password),
                'password should match the pattern'
            );
        }

        if (isActive !== undefined) {
            assert.strictEqual(typeof isActive, 'boolean', 'isActive should be a boolean');
        }

        if (street !== undefined) {
            assert.strictEqual(typeof street, 'string', 'street should be a string');
        }

        if (city !== undefined) {
            assert.strictEqual(typeof city, 'string', 'city should be a string');
        }

        if (phoneNumber !== undefined) {
            assert.strictEqual(typeof phoneNumber, 'string', 'phoneNumber should be a string');
            assert.ok(
                /^06[-\s]?\d{8}$/.test(phoneNumber),
                'phoneNumber should match the pattern'
            );
        }

        if (roles !== undefined) {
            assert.ok(Array.isArray(roles), 'roles should be an array');
        }

        next();
    } catch (err) {
        return res.status(400).json({
            status: 400,
            message: err.message,
            error: err.toString(),
        });
    }
};




// Userroutes
router.post('/api/user', validateUserCreate, userController.create)
router.delete('/api/user/:userId', validateUserIdChaiExpect, validateToken, userController.delete)
router.get('/api/user', validateToken, userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateUserIdChaiExpect, validateToken, userController.getById)
router.put('/api/user/:userId', validateUserUpdate, validateToken, userController.update)
module.exports = router
