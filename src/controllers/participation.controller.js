const participationService = require('../services/participation.service')
const logger = require('../util/logger')
let participationController = {
    getAll: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId
        logger.info('getAllMeals mealId', mealId)
        logger.info('getAllMeals userId', userId)
        participationService.getAll(userId, mealId, (error, success)  => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    register: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId
        logger.info('register for mealId ', mealId)
        logger.info('register with userId ', userId)
        participationService.register(userId, mealId, (error, success)  => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    getParticipantContact: (req, res, next) => {
        const mealId = req.params.mealId
        const participantId = req.params.participantId
        const userId = req.userId
        logger.info('getAllMeals mealId', mealId)
        logger.info('getAllMeals userId', userId)
        logger.info('getAllMeals participantId', participantId)
        participationService.getParticipantContact(userId, mealId, participantId, (error, success)  => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    signout: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId
        logger.info('register for mealId ', mealId)
        logger.info('register with userId ', userId)
        participationService.signout(userId, mealId, (error, success)  => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    }

}
module.exports = participationController