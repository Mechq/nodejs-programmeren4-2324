
const logger = require('../util/logger')
const db = require('../dao/mysql-db.js')
const mealService = {
    create: (user, callback) => {
        logger.info('create meal', user);

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }

            const { firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city } = user;

            connection.query(
                'INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)',
                [id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error('error creating meal:', error.message || 'unknown error');
                        callback(error, null);
                    } else {
                        logger.trace('Meal created.');
                        callback(null, {
                            data: results
                        });
                    }
                }
            );
        });
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

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            data: results
                        })
                    }
                }
            )
        })
    },
    delete: (mealId, callback) => {
        logger.info('delete meal', mealId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
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
                            message: `Meal deleted with id ${mealId}.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    update: (mealId, meal, callback) => {
        logger.info('update meal', mealId);

        const valuesToUpdate = [];
        const columnsToUpdate = Object.keys(meal)
            .filter(key => meal[key] !== undefined && meal[key] !== null) // Filter out undefined or null values
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
                            message: `Meal updated with id ${mealId}.`,
                            data: results
                        });
                    }
                }
            );
        });
    }


}
module.exports = mealService