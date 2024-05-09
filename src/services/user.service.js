const database = require('../dao/inmem-db')
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

            const { firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city } = user;

            connection.query(
                'INSERT INTO user (firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city],
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error('error creating user:', error.message || 'unknown error');
                        callback(error, null);
                    } else {
                        logger.trace('User created.');
                        callback(null, {
                            message: 'User created.',
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
                'SELECT * FROM `user`',
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found ${results.length} users.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    getById: (userId, callback) => {
        logger.info('getById');
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT * FROM `user` WHERE id = ?',
                id = userId,
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        logger.debug(results)
                        callback(null, {
                            message: `Found user.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    delete: (userId, callback) => {
        logger.info('delete user', userId)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM `user` WHERE id = ?',
                id = userId,
                function (error, results, fields) {
                    connection.release()

                    if (err) {
                        logger.info(
                            'error deleting user: ',
                            err.message || 'unknown error'
                        )
                        callback(err, null)
                    } else {
                        logger.trace(`User deleted with id ${userId}.`)
                        callback(null, {
                            message: `User deleted with id ${userId}.`,
                            data: results
                        })
                    }
                }
            )
        })
    },
    update: (userId, user, callback) => {
        logger.info('update user', userId);

        const valuesToUpdate = [];
        const columnsToUpdate = Object.keys(user)
            .filter(key => user[key] !== undefined && user[key] !== null) // Filter out undefined or null values
            .map(key => {
                valuesToUpdate.push(user[key]);
                return `${key}=?`;
            });

        if (columnsToUpdate.length === 0) {
            // No fields to update
            callback(new Error('No fields to update'), null);
            return;
        }

        const setClause = columnsToUpdate.join(', ');
        const sql = `UPDATE user SET ${setClause} WHERE id = ?`;

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }

            const values = [...valuesToUpdate, userId];

            connection.query(
                sql,
                values,
                function (error, results, fields) {
                    connection.release();

                    if (error) {
                        logger.error('Error updating user:', error.message || 'unknown error');
                        callback(error, null);
                    } else {
                        logger.trace(`User updated with id ${userId}.`);
                        callback(null, {
                            message: `User updated with id ${userId}.`,
                            data: results
                        });
                    }
                }
            );
        });
    }

}

module.exports = userService
