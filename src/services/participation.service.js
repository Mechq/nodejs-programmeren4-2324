const logger = require('../util/logger');
const db = require('../dao/mysql-db.js');
const participationService = {
    getAll: (userId, mealId, callback) => {
        logger.info('getAll', mealId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            // query om voor mealId de cookId op te halen
            // als cookId gelijk is aan userId, dan is de user de cook
            // en kan de user deelnemers opvragen
            connection.query(

                'SELECT cookId FROM `meal` WHERE `id` = ?',
                [mealId],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error(error);
                        callback(error, null);
                    } else {
                        logger.debug(results);
                        if (results[0].cookId === userId) {
                            connection.query(

                                'SELECT * FROM `meal_participants_user` WHERE `mealId` = ?',
                                [mealId],
                                function (error, results, fields) {
                                    connection.release();

                                    if (error) {
                                        logger.error(error);
                                        callback(error, null);
                                    } else {
                                        logger.debug(results);
                                        callback(null, {
                                            message: `Found ${results.length} participations.`,
                                            data: results
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(null, {
                                message: `User is not the cook of the meal.`,
                                data: {}
                            });
                        }
                    }
                }
            );
        });
    }
};
module.exports = participationService;
