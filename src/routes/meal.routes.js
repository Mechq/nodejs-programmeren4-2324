const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const logger = require('../util/logger')

router.post('/api/meal/create', mealController.create)
router.get('/api/meal', mealController.getAll)
router.get('/api/meal/:mealId', mealController.getById)
router.put('/api/meal/:mealId', mealController.update)
router.delete('/api/meal/:mealId', mealController.delete)
module.exports = router

