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
    },
    register: (userId, mealId, callback) => {
        logger.info('register user: ', userId, ' for meal: ', mealId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            connection.query(
                'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (?, ?)',
                [mealId, userId],
                function (error, results, fields) {
                    connection.release();
                    if (error) {
                        logger.error(error);
                        callback(error, null);
                    } else {
                        logger.debug(results);
                        callback(null, {
                            message: 'Participation created.',
                            data: results
                        });
                    }
                }
            );
        });
    },
    getAllContacts: (userId, mealId, participantId, callback) => {
        logger.info('getAllContacts for meal ', mealId, ' and participant ', participantId, ' for user ', userId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }

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
                        if (results.length === 0) {
                            callback(null, {
                                message: `Meal not found.`,
                                data: {}
                            });
                        } else {
                            const cookId = results[0].cookId;
                            if (cookId === userId) {
                                connection.query(
                                    'SELECT userId FROM `meal_participants_user` WHERE `mealId` = ?',
                                    [mealId],
                                    function (error, results, fields) {
                                        connection.release();
                                        if (error) {
                                            logger.error(error);
                                            callback(error, null);
                                        } else {
                                            logger.debug(results);
                                            // Check if the specified participantId is in the results
                                            const participantIds = results.map(result => result.userId);
                                            participantId = parseInt(participantId, 10)
                                            if (participantIds.includes(participantId)) {
                                                connection.query(
                                                    'SELECT id, emailAddress, phoneNumber FROM `user` WHERE `id` = ?',
                                                    [participantId],
                                                    function (error, results, fields) {
                                                        if (error) {
                                                            logger.error(error);
                                                            callback(error, null);
                                                        } else {
                                                            logger.debug(results);
                                                            callback(null, {
                                                                message: `Found participant.`,
                                                                data: results
                                                            });
                                                        }
                                                    }
                                                );
                                            } else {
                                                callback(null, {
                                                    message: `User does not participate in the meal.`,
                                                    data: {}
                                                });
                                            }
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
                }
            );
        });
    }

};
module.exports = participationService;
