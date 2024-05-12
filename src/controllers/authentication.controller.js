//
// Authentication controller
//
const logger = require('../util/logger')
const authService = require('../services/authentication.service')

const authController = {
    login: (req, res, next) => {
        const userCredentials = req.body
        logger.debug('login', userCredentials)
        authService.login(userCredentials, (error, success) => {
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
    info: (req, res, next) => {
        logger.debug('info')
        authService.login((error, success) => {
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
                    data: ("Stef Rensma \n2217058 \nDit is een api server voor een maaltijd planner. ")
                })
            }
        })
    }
}

module.exports = authController