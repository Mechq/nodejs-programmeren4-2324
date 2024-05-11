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

const validateUserCreateChaiExpect = (req, res, next) => {
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

        assert.ok(firstName, 'firstName should not be empty');
        assert.strictEqual(
            typeof firstName,
            'string',
            'firstName should be a string'
        );

        assert.ok(lastName, 'lastName should not be empty');
        assert.strictEqual(
            typeof lastName,
            'string',
            'lastName should be a string'
        );

        assert.ok(emailAddress, 'emailAddress should not be empty');
        assert.strictEqual(
            typeof emailAddress,
            'string',
            'emailAddress should be a string'
        );
        assert.ok(
            /^[a-zA-Z][.][a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(
                emailAddress
            ),
            'emailAddress should match the pattern'
        );

        assert.ok(password, 'password should not be empty');
        assert.strictEqual(
            typeof password,
            'string',
            'password should be a string'
        );
        assert.ok(
            /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password),
            'password should match the pattern'
        );

        assert.ok(isActive !== undefined, 'isActive should not be empty');
        assert.strictEqual(
            typeof isActive,
            'boolean',
            'isActive should be a boolean'
        );

        assert.ok(street, 'street should not be empty');
        assert.strictEqual(typeof street, 'string', 'street should be a string');

        assert.ok(city, 'city should not be empty');
        assert.strictEqual(typeof city, 'string', 'city should be a string');

        assert.ok(phoneNumber, 'phoneNumber should not be empty');
        assert.strictEqual(
            typeof phoneNumber,
            'string',
            'phoneNumber should be a string'
        );
        assert.ok(
            /^06[-\s]?\d{8}$/.test(phoneNumber),
            'phoneNumber should match the pattern'
        );

        assert.ok(Array.isArray(roles), 'roles should be an array');

        // Move to the next middleware if validation passes
        next();
    } catch (err) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid user data',
            error: err.toString(),
        });
    }
};
const validateUserIdChaiExpect = (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        assert(userId, 'Missing or incorrect number field');
        chai.expect(userId).to.not.be.NaN;
        chai.expect(userId).to.be.a('number');
        chai.expect(userId).to.match(
            /^[1-9]+$/,
            'userId must be a number'
        );
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

const validateUserUpdateChaiExpect = (req, res, next) => {
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
        if (firstName !== undefined) {
        assert.strictEqual(
            typeof firstName,
            'string',
            'firstName should be a string'
        )}
        if (lastName !== undefined) {
        assert.strictEqual(
            typeof lastName,
            'string',
            'lastName should be a string'
        )}
        if (emailAddress !== undefined) {
        assert.strictEqual(
            typeof emailAddress,
            'string',
            'emailAddress should be a string'
        )
        assert.ok(
            /^[a-zA-Z][.][a-zA-Z]{2,}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$/.test(
                emailAddress
            ),
            'emailAddress should match the pattern'
        )}

        if (password !== undefined) {
        assert.strictEqual(
            typeof password,
            'string',
            'password should be a string'
        )
        assert.ok(
            /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password),
            'password should match the pattern'
        )}

        if (isActive !== undefined) {
        assert.strictEqual(
            typeof isActive,
            'boolean',
            'isActive should be a boolean'
        )}

        if (street !== undefined) {
        assert.strictEqual(typeof street, 'string', 'street should be a string')}

        if (city !== undefined) {
        assert.strictEqual(typeof city, 'string', 'city should be a string')}

        if (phoneNumber !== undefined) {
        assert.strictEqual(
            typeof phoneNumber,
            'string',
            'phoneNumber should be a string'
        )
        assert.ok(
            /^06[-\s]?\d{8}$/.test(phoneNumber),
            'phoneNumber should match the pattern'
        )}
        if (roles !== undefined) {
        assert.ok(Array.isArray(roles), 'roles should be an array')}

        // Move to the next middleware if validation passes
        next();
    } catch (err) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid user data',
            error: err.toString(),
        });
    }
};


// Userroutes
router.post('/api/user/create', validateUserCreateChaiExpect, userController.create)
router.delete('/api/user/:userId', validateUserIdChaiExpect, userController.delete)
router.get('/api/user', userController.getAll)
router.get('/api/user/profile', validateToken, userController.getProfile)
router.get('/api/user/:userId', validateUserIdChaiExpect, userController.getById)
router.put('/api/user/:userId', validateUserUpdateChaiExpect, userController.update)
module.exports = router
