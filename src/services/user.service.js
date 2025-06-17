
const logger = require('../util/logger')
const db = require('../dao/mysql-db.js')
const userService = {
    create: (user, callback) => {
        logger.info('create user', user);

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }

            const { firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city} = user;
            connection.query(
                'INSERT INTO user (firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        if (error.code === 'ER_DUP_ENTRY') {
                            const errorMessage = `Email address '${emailAddress}' already exists.`
                            const errorObject = new Error(errorMessage)
                            errorObject.status = 400
                            callback(errorObject, null)
                        } else {

                            logger.error('Error creating user:', error.message || 'unknown error')
                            callback(error, null)
                        }
                    }  else {
                        logger.trace('User created with status ' + '201')
                        callback(null, {
                            status: 201,
                            message: 'User created.',
                            data: {
                                userId: results.insertId,
                                ...user
                            }
                        });
                    }
                }
            );
        });
    },


    getAll: (isActive, role, callback) => {
        logger.info('getAll')
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
            let sqlString = "SELECT * FROM `user` WHERE 1=1"; // Initialize SQL string with a condition that's always true
            let values = []; // Initialize values array to hold parameter values

            if (isActive !== undefined) {
                sqlString += " AND isActive = ?";
                values.push(isActive);
            }

            if (role !== undefined) { // Corrected to use role instead of roles
                sqlString += " AND FIND_IN_SET(?, roles)"; // Corrected the SQL syntax
                values.push(role);
            }
            connection.query(
                sqlString,
                values, // Pass the values array instead of wrapping in another array
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error(error);
                        callback(error, null);
                    } else {
                        logger.debug(results);
                        callback(null, {
                            message: `Found ${results.length} users.`,
                            data: results
                        });
                    }
                }
            );
        });
    },
    getById: (userId, creatorId, callback) => {
        logger.info('getById');
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, emailAddress, firstName, lastName, phoneNumber, password FROM `user` WHERE id = ?',
                [userId],
                function (error, resultsUser, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(resultsUser)
                        userId = parseInt(userId, 10)
                        creatorId = parseInt(creatorId, 10)
                        if (resultsUser && resultsUser.length > 0) {
                            if (userId !== creatorId) {
                                resultsUser[0].password = undefined
                            }
                            connection.query(
                                'SELECT id, name, description FROM `meal` WHERE cookId = ?',
                                [userId],
                                function (error, resultsMeal, fields) {
                                    connection.release()

                                    if (error) {
                                        logger.error(error)
                                        callback(error, null)
                                    } else {
                                        logger.debug(resultsMeal)
                                        callback(null, {
                                            message: `Found ${resultsUser.length} user.`,
                                            data: [resultsUser, resultsMeal]
                                        })
                                    }
                                }
                            )
                        } else {
                            const errorMessage = `User met ID ${userId} bestaat niet`
                            const errorObject = new Error(errorMessage);
                            errorObject.status = 404;
                            callback(errorObject, null);
                        }
                    }
                }
            )
        })
    }
    ,
    delete: (userIdToDelete, creatorId, callback) => {
        logger.info('delete user', userIdToDelete);
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                return callback({ status: 500, message: 'Database connection error' }, null);
            }

            userIdToDelete = parseInt(userIdToDelete, 10);
            creatorId = parseInt(creatorId, 10);


            if (creatorId !== userIdToDelete) {
                connection.release();
                logger.info('User not authorized to delete this user: Creator ID', creatorId, 'User ID to delete', userIdToDelete);
                return callback({ status: 403, message: 'You are not authorized to delete this user.' }, null);
            }

            connection.query(
                'DELETE FROM `user` WHERE id = ?',
                [userIdToDelete],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error('error deleting user:', error.message || 'unknown error');
                        return callback({ status: 500, message: 'Failed to delete user', data: error }, null);
                    }

                    if (results.affectedRows === 0) {

                        logger.warn(`Attempted to delete non-existent user with id ${userIdToDelete}.`);
                        return callback({
                            status: 404,
                            message: `User with ID ${userIdToDelete} not found.`
                        }, null);
                    }

                    logger.trace(`User deleted with id ${userIdToDelete}.`);
                    return callback(null, {
                        status: 200,
                        message: `User with ID ${userIdToDelete} is verwijderd`,
                        data: { affectedRows: results.affectedRows }
                    });
                }
            );
        });
    },
    update: (userId, creatorId, user, callback) => {
        logger.info('update user', userId);
        userId = parseInt(userId, 10);


        if (userId === creatorId) {
            const { emailAddress } = user;
            if (!emailAddress) {
                callback(new Error('Email address is required'), null);
                return;
            }

            db.getConnection(function (err, connection) {
                if (err) {
                    logger.error(err);
                    callback(err, null);
                    return;
                }


                connection.query(
                    'SELECT emailAddress FROM `user` WHERE id = ?',
                    [userId],
                    function (error, results, fields) {
                        if (error) {
                            connection.release();
                            logger.error(error);
                            callback(error, null);
                            return;
                        }

                        const currentEmail = results[0].emailAddress;

                        if (currentEmail !== emailAddress) {
                            connection.release();
                            const errorMessage = 'Email address does not match the current email address of the user'
                            callback(new Error(errorMessage), null);
                            return;
                        }

                        const valuesToUpdate = [];
                        const columnsToUpdate = Object.keys(user)
                            .filter(key => user[key] !== undefined && user[key] !== null && key !== 'emailAddress')
                            .map(key => {
                                valuesToUpdate.push(user[key]);
                                return `${key}=?`;
                            });

                        if (columnsToUpdate.length === 0) {
                            connection.release();
                            callback(new Error('No fields to update'), null);
                            return;
                        }

                        const setClause = columnsToUpdate.join(', ')
                        const sql = `UPDATE user SET ${setClause} WHERE id = ?`

                        const values = [...valuesToUpdate, userId]

                        connection.query(
                            sql,
                            values,
                            function (error, results, fields) {
                                connection.release();

                                if (error) {
                                    logger.error('Error updating user:', error.message || 'unknown error')
                                    callback(error, null);
                                } else {
                                    logger.trace(`User updated with id ${userId}.`)
                                    callback(null, {
                                        message: `User updated with id ${userId}.`,
                                        data: user
                                    });
                                }
                            }
                        );
                    }
                );
            });
        } else {
            logger.info('User not authorized to update user');
            const errorMessage = 'User not authorized to update user';
            const errorObject = new Error(errorMessage);
            errorObject.status = 403;
            callback(errorObject, null);
        }
    },

    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} user.`,
                            data: results
                        })
                    }
                }
            )
        })
    }

}

module.exports = userService
