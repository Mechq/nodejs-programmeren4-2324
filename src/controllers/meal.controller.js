const mealService = require('../services/meal.service')
const logger = require('../util/logger')
const userService = require("../services/user.service");

let userController = {
    create: (req, res, next) => {
        const meal = req.body
        const userId = req.userId

        logger.info('create meal ', meal.name, meal.id, ' userId: ', userId)
        mealService.create(meal, userId, (error, success) => {
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
    getAll: (req, res, next) => {
        logger.trace('getAll')
        mealService.getAll((error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    getById: (req, res, next) => {
        const mealId = req.params.mealId;
        logger.trace('mealController: getById', mealId);
        mealService.getById(mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },
    delete: (req, res, next) => {
        const mealId = req.params.mealId;
        const userId = req.userId;
        logger.info('delete meal', mealId);
        mealService.delete(mealId, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    },
    update: (req, res, next) => {
        const mealId = req.params.mealId;
        const meal = req.body;
        const userId = req.userId;
        logger.info('update meal', mealId);
        mealService.update(mealId, meal, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                });
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                });
            }
        });
    }

}
module.exports = userController
