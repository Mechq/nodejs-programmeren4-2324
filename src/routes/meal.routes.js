const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')
const validateToken = require('./authentication.routes').validateToken

const validateMealCreateChaiExpect = (req, res, next) => {
    try {
        const {
            isVega,
            isVegan,
            isToTakeHome,
            // dateTime,
            maxAmountOfParticipants,
            price,
            imageUrl,
            name,
            description,
            allergenes
        } = req.body;

        assert.strictEqual(
            typeof isVega,
            'number',
            'isVega should be a number'
        )
        assert.strictEqual(
            isVega === 0 || isVegan === 1,
            true,
            'isVega should be either 0 or 1'
        )

        assert.strictEqual(
            typeof isVegan,
            'number',
            'isVegan should be a number'
        )
        assert.strictEqual(
            isVegan === 0 || isVegan === 1,
            true,
            'isVegan should be either 0 or 1'
        )

        assert.strictEqual(
            typeof isToTakeHome,
            'number',
            'isToTakeHome should be a number'
        )
        assert.strictEqual(
            isToTakeHome === 0 || isVegan === 1,
            true,
            'isToTakeHome should be either 0 or 1'
        )


        assert.strictEqual(
            typeof maxAmountOfParticipants,

            'number',
            maxAmountOfParticipants > 0,
            'maxAmountOfParticipants should be a number (higher than 0)'
        );

        logger.trace(typeof price)
        assert.ok(price, 'price should not be empty');
        assert.strictEqual(
            typeof price,
            'number',
            'price should be a number'
        )
        assert.strictEqual(
            price > 0,
            true,
            'price should be a positive number'
        )


        assert.ok(imageUrl, 'imageUrl should not be empty')
        assert.strictEqual(typeof imageUrl, 'string', 'imageUrl should be a string')

        assert.ok(name, 'name should not be empty')
        assert.strictEqual(typeof name, 'string', 'name should be a string')

        assert.ok(description, 'description should not be empty')
        assert.strictEqual(
            typeof description,
            'string',
            'description should be a string'
        )
        const validAllergenes = new Set(['gluten', 'lactose', 'noten'])
        assert.strictEqual(
            validAllergenes.has(allergenes),
            true,
            'allergenes should only accept values "gluten", "lactose", or "noten"'
        )

        next();
    } catch (err) {
        return res.status(400).json({
            status: 400,
            message: 'Invalid user data',
            error: err.toString(),
        });
    }
};

router.post('/api/meal', validateToken, validateMealCreateChaiExpect, mealController.create)
router.get('/api/meal', mealController.getAll)
router.get('/api/meal/:mealId', mealController.getById)
router.put('/api/meal/:mealId', mealController.update)
router.delete('/api/meal/:mealId', mealController.delete)
module.exports = router

