const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const validateToken = require('./authentication.routes').validateToken
const participationController = require('../controllers/participation.controller')
const logger = require('../util/logger')
const userController = require("../controllers/user.controller");

router.get('/api/meal/:mealId/participants', validateToken, participationController.getAll)
router.post('/api/meal/:mealId/participate', validateToken, participationController.register)
router.get('/api/meal/:mealId/participants/:participantId', validateToken, participationController.getParticipantContact)
router.delete('/api/meal/:mealId/participate', validateToken, participationController.signout)
module.exports = router