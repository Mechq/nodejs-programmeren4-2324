
const logger = require('../util/logger')
const db = require('../dao/mysql-db.js')
const mealService = {
    create: (meal, userId, callback) => {
        logger.info('create meal', meal);
        logger.info(' aaa ',meal.isVegan)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                // Consistent error object (as discussed previously)
                callback({ status: 500, message: 'Database connection error' }, null);
                return;
            }

            const isVega = meal.isVega  === 1 ? 1 : 0
            const isVegan = meal.isVegan === 1 ? 1 : 0
            const isToTakeHome = meal.isToTakeHome  === 0 ? 0 : 1 // Changed from 1 to 0 for consistency with logic
            const maxAmountOfParticipants = meal.maxAmountOfParticipants ? meal.maxAmountOfParticipants : 6;
            const price = meal.price
            const imageUrl = meal.imageUrl
            const name = meal.name
            const description = meal.description
            const allergenes = meal.allergenes
            logger.trace(isVegan, isVega, isToTakeHome, maxAmountOfParticipants, price, imageUrl, userId, name, description, allergenes)

            connection.query(
                'INSERT INTO meal (isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ?, ?, ?)',
                [isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, userId, name, description, allergenes],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error('error creating meal:', error.message || 'unknown error');
                        // Consistent error object (as discussed previously)
                        callback({ status: 500, message: 'Failed to create meal', data: error }, null);
                    } else {
                        logger.trace('Meal created. Insert ID:', results.insertId); // Log the ID for debugging
                        callback(null, {
                            message: 'Maaltijd aangemaakt',
                            status: 200,
                            data: {
                                id: results.insertId,
                                ...meal
                            }
                        })
                    }
                }
            )
        })
    },
    getAll: (callback) => {
        logger.info('getAll')
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `meal`',
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} meals.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    getById: (mealId, callback) => {
        logger.info('getById', mealId);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `meal` WHERE id = ?',
                id = mealId,
                function (error, results, fields) {
                    connection.release()

                    if (!results || results.length === 0) {
                        callback(null, {
                            status: 400,
                            message: `Meal for MealId: ${mealId} not found.`,
                        });
                        return;
                    }

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            data: results[0]
                        })
                    }
                }
            )
        })
    },
    delete: (mealId, userId, callback) => {
        logger.info('delete meal', mealId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
                connection.query(
                    'SELECT cookId FROM meal WHERE id = ?',
                    [mealId],
                    function (error, results) {
                        if (error) {
                            connection.release();
                            logger.error('Error fetching cookId:', error.message || 'unknown error');
                            callback(error, null);
                            return;
                        }


                        if (results.length === 0) { // Meal not found
                            connection.release();
                            callback({
                                status: 404,
                                message: 'Meal not found'
                            }, null);
                            return;
                        }
                        const dbCookId = results[0].cookId;
                        const tokenUserId = parseInt(userId);


                        if (dbCookId !== tokenUserId) { // Unauthorized to update
                            connection.release();
                            callback({
                                status: 403,
                                message: 'You are not authorized to delete this meal'
                            }, null);
                            return;
                        }

                        connection.query(
                            'DELETE FROM `meal` WHERE id = ?',
                            id = mealId,
                            function (error, results, fields) {
                                connection.release()

                                if (err) {
                                    logger.info(
                                        'error deleting meal: ',
                                        err.message || 'unknown error'
                                    )
                                    callback(err, null)
                                } else {
                                    logger.trace(`Meal deleted with id ${mealId}.`)
                                    callback(null, {
                                        message: `Maaltijd met ID ${mealId} is verwijderd`,
                                        data: results
                                    })
                                }
                            })
                    })
        })
    },
    update: (mealId, meal, userId, callback) => {
        logger.info('update meal', mealId);
        logger.info('update with user', userId)
        logger.info('update for meal', meal)
        const valuesToUpdate = [];
        const columnsToUpdate = Object.keys(meal)
            .filter(key => meal[key] !== undefined && meal[key] !== null)
            .map(key => {
                valuesToUpdate.push(meal[key]);
                return `${key}=?`;
            });

        if (columnsToUpdate.length === 0) {
            // No fields to update
            callback(new Error('No fields to update'), null);
            return;
        }

        const setClause = columnsToUpdate.join(', ');
        const sql = `UPDATE meal SET ${setClause} WHERE id = ?`;

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }

            connection.query(
                'SELECT cookId FROM meal WHERE id = ?',
                [mealId],
                function (error, results) {
                    if (error) {
                        connection.release();
                        logger.error('Error fetching cookId:', error.message || 'unknown error');
                        callback(error, null);
                        return;
                    }


                    if (results.length === 0) {
                        connection.release();
                        callback({
                            status: 404,
                            message: 'Meal not found'
                        }, null);
                        return;
                    }
                    const dbCookId = results[0].cookId;
                    const tokenUserId = parseInt(userId);


                    if (dbCookId !== tokenUserId) {
                        connection.release();
                        callback({
                            status: 403,
                            message: 'You are not authorized to update this meal'
                        }, null);
                        return;
                    }
                    const values = [...valuesToUpdate, mealId];

                    connection.query(
                        sql,
                        values,
                        function (error, results, fields) {
                            connection.release();

                            if (error) {
                                logger.error('Error updating meal:', error.message || 'unknown error');
                                callback(error, null);
                            } else {
                                logger.trace(`Meal updated with id ${mealId}.`);
                                callback(null, {
                                    status: 200, // <--- Add this
                                    message: `Meal updated with id ${mealId}.`,
                                    data: { id: mealId } // Optionally, return the updated meal ID or partial data
                                });
                            }
                        }
                    );
                }
            );


        });
    }


}
module.exports = mealService