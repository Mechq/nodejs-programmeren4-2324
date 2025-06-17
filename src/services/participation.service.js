const logger = require('../util/logger');
const db = require('../dao/mysql-db.js');

const participationService = {
    getAll: (userId, mealId, callback) => {
        logger.info('getAll', mealId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                return callback({ status: 500, message: 'Database connection error' }, null);
            }

            // Query to get cookId for the given mealId
            connection.query(
                'SELECT cookId FROM `meal` WHERE `id` = ?',
                [mealId],
                function (error, results) {
                    if (error) {
                        connection.release();
                        logger.error(error);
                        return callback({ status: 500, message: 'Error fetching meal cookId' }, null);
                    }

                    if (!results || results.length === 0) {
                        connection.release();
                        return callback({
                            status: 404, // Corrected to 404 if meal doesn't exist
                            message: `Meal for MealId: ${mealId} not found.`,
                        }, null);
                    }

                    const cookId = results[0].cookId;
                    // Important: Convert userId from string (from JWT) to number for comparison with DB cookId
                    const numericUserId = parseInt(userId, 10);

                    if (cookId === numericUserId) {
                        // User is the cook, fetch participants
                        connection.query(
                            'SELECT * FROM `meal_participants_user` WHERE `mealId` = ?',
                            [mealId],
                            function (error, participants) { // Renamed results to participants for clarity
                                connection.release(); // Release connection after all queries are done
                                if (error) {
                                    logger.error(error);
                                    return callback({ status: 500, message: 'Error fetching participants' }, null);
                                } else {
                                    logger.debug(participants);
                                    return callback(null, {
                                        status: 200, // Added status
                                        message: `Found ${participants.length} participations.`,
                                        data: participants
                                    });
                                }
                            }
                        );
                    } else {
                        connection.release(); // Release connection if not the cook
                        return callback({
                            status: 403, // Use 403 Forbidden
                            message: `User is not authorized to view participants for this meal.`,
                            data: {}
                        }, null); // Return an error, not a success with an empty data object
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
                return callback({ status: 500, message: 'Database connection error' }, null);
            }
            connection.query(
                'INSERT INTO `meal_participants_user` (`mealId`, `userId`) VALUES (?, ?)',
                [mealId, userId],
                function (error, results, fields) {
                    connection.release();
                    if (error) {
                        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                            const errorMessage = `Meal with ID ${mealId} does not exist.`;
                            logger.error(errorMessage);
                            // Corrected to pass an error object, not a mix
                            return callback({ status: 404, message: errorMessage }, null);
                        } else if (error.code === 'ER_DUP_ENTRY') {
                            // Handle duplicate entry if user tries to register twice
                            const errorMessage = `User ${userId} is already registered for meal ${mealId}.`;
                            logger.warn(errorMessage);
                            return callback({ status: 400, message: errorMessage }, null);
                        } else {
                            logger.error(error);
                            return callback({ status: 500, message: 'Failed to register for meal', data: error }, null);
                        }
                    } else {
                        logger.debug(results);
                        return callback(null, {
                            message: `User met ID ${userId} is aangemeld voor maaltijd met ID ${mealId}`,
                            status: 200,
                            data: {}
                        });
                    }
                }
            );
        });
    },

    getParticipantContact: (userId, mealId, participantId, callback) => {
        logger.info('getAllContacts for meal ', mealId, ' and participant ', participantId, ' for user ', userId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                return callback({ status: 500, message: 'Database connection error' }, null);
            }

            // Check if the user is the cook of the meal
            connection.query(
                'SELECT cookId FROM `meal` WHERE `id` = ?',
                [mealId],
                function (error, results) {
                    if (error) {
                        connection.release();
                        logger.error(error);
                        return callback({ status: 500, message: 'Error fetching meal cookId' }, null);
                    }

                    if (results.length === 0) {
                        connection.release();
                        return callback({
                            status: 404,
                            message: `Meal not found.`
                        }, null);
                    }

                    const cookId = results[0].cookId;
                    const numericUserId = parseInt(userId, 10); // Convert userId to number

                    if (cookId === numericUserId) {
                        // User is the cook, now check if participant is in the meal
                        connection.query(
                            'SELECT userId FROM `meal_participants_user` WHERE `mealId` = ?',
                            [mealId],
                            function (error, participantResults) { // Renamed for clarity
                                if (error) {
                                    connection.release();
                                    logger.error(error);
                                    return callback({ status: 500, message: 'Error fetching meal participants' }, null);
                                }

                                const participantIds = participantResults.map(result => result.userId);
                                const numericParticipantId = parseInt(participantId, 10); // Convert participantId to number

                                if (participantIds.includes(numericParticipantId)) {
                                    // Participant is in the meal, fetch contact info
                                    connection.query(
                                        'SELECT id, emailAddress, phoneNumber FROM `user` WHERE `id` = ?',
                                        [numericParticipantId],
                                        function (error, contactResults) { // Renamed for clarity
                                            connection.release(); // Release connection after final query
                                            if (error) {
                                                logger.error(error);
                                                return callback({ status: 500, message: 'Error fetching participant contact' }, null);
                                            } else {
                                                logger.debug(contactResults);
                                                return callback(null, {
                                                    status: 200, // Added status
                                                    message: `Found participant contact.`,
                                                    data: contactResults[0] || {} // Return single object or empty
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    connection.release(); // Release connection
                                    return callback({
                                        status: 404, // Participant not found for this meal
                                        message: `User is not participating in the specified meal.`
                                    }, null);
                                }
                            }
                        );
                    } else {
                        connection.release(); // Release connection
                        return callback({
                            status: 403, // Forbidden
                            message: `User is not the cook of the meal.`
                        }, null);
                    }
                }
            );
        });
    },

    signout: (userId, mealId, callback) => {
        const numericMealId = parseInt(mealId, 10);
        const numericUserId = parseInt(userId, 10);
        logger.info('Signing out user: ', numericUserId, ' from meal: ', numericMealId);

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                return callback({ status: 500, message: 'Database connection error' }, null);
            }

            // Check if the user is actually participating in the meal
            connection.query(
                'SELECT `mealId` FROM `meal_participants_user` WHERE `userId` = ? AND `mealId` = ?',
                [numericUserId, numericMealId],
                function (error, results) {
                    if (error) {
                        connection.release();
                        logger.error(error);
                        return callback({ status: 500, message: 'Error checking participation status' }, null);
                    }

                    if (results.length === 0) {
                        connection.release();
                        return callback({
                            status: 404, // User is not participating in this specific meal
                            message: `User is not participating in meal with ID ${numericMealId}.`
                        }, null);
                    }

                    // User is participating, proceed with deletion
                    connection.query(
                        'DELETE FROM `meal_participants_user` WHERE `userId` = ? AND `mealId` = ?',
                        [numericUserId, numericMealId],
                        function (error, deleteResults) { // Renamed results to deleteResults
                            connection.release(); // Release connection after the delete query
                            if (error) {
                                logger.error(error);
                                return callback({ status: 500, message: 'Failed to sign out from meal', data: error }, null);
                            } else {
                                if (deleteResults.affectedRows === 0) {
                                    // This case should theoretically be caught by the SELECT above,
                                    // but as a safeguard, it means nothing was deleted.
                                    return callback({ status: 404, message: 'Participation not found or already removed.' }, null);
                                }
                                logger.debug(deleteResults);
                                return callback(null, {
                                    status: 200,
                                    message: `User with ID ${numericUserId} signed out from meal with ID ${numericMealId}.`,
                                    data: {}
                                });
                            }
                        }
                    );
                }
            );
        });
    }
};

module.exports = participationService;