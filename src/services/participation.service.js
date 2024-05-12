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
                            message: `User met ID ${userId} is aangemeld voor maaltijd met ID ${mealId}`,
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
                            }

                        }
                    }
                }
            );
        });
    },
    signout: (userId, mealId, callback) => {
        logger.info('signed out user: ', userId, ' for meal: ', mealId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            // Alle deelnemende meal ids van een user ophalen
            // als de mealId van de user gelijk is aan de meegegeven mealId
            // dan kan de user zich uitschrijven
            connection.query(
                'SELECT mealId FROM `meal_participants_user` WHERE `userId` = ?',
                [userId],
                function (error, results, fields) {
                    if (error) {
                        connection.release();
                        logger.error(error);
                        callback(error, null);
                    } else {
                        logger.debug(results);
                        let found = false;
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].mealId === mealId) {
                                found = true;
                                connection.query(
                                    'DELETE FROM `meal_participants_user` WHERE userId = (?) AND mealId = (?)',
                                    [userId, mealId],
                                    function (error, results, fields) {
                                        connection.release();
                                        if (error) {
                                            logger.error(error);
                                            callback(error, null);
                                        } else {
                                            logger.debug(results);
                                            callback(null, {
                                                message: `‘User met ID ${userId} is afgemeld voor maaltijd met ID ${mealId}`,
                                                data: results
                                            });
                                        }
                                    }
                                );
                                break; // Exit the loop once found
                            }
                        }
                        if (!found) {
                            connection.release();
                            callback(null, {
                                message: 'User is not participating in the specified meal.',
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
