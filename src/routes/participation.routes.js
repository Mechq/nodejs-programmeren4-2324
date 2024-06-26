const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const validateToken = require('./authentication.routes').validateToken
const participationController = require('../controllers/participation.controller')
const logger = require('../util/logger')


router.get('/api/participations/:mealId', validateToken, participationController.getAll)
router.post('/api/participations/:mealId', validateToken, participationController.register)
router.get('/api/meal/:mealId/participants/:participantId', validateToken, participationController.getParticipantContact)
router.delete('/api/participations/:mealId', validateToken, participationController.signout)
module.exports = router