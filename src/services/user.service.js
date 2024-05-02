const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        database.add(user, (err, data) => {
            if (err) {
                logger.info(
                    'error creating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User created with id ${data.id}.`)
                callback(null, {
                    message: `User created with id ${data.id}.`,
                    data: data
                })
            }
        })
    },

    getAll: (callback) => {
        logger.info('getAll')
        database.getAll((err, data) => {
            if (err) {
                callback(err, null)
            } else {
                callback(null, {
                    message: `Found ${data.length} users.`,
                    data: data
                })
            }
        })
    },
    getById: (userId, callback) => {
        logger.info('getById');
        database.getById(userId, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {
                    message: `Found user with id ${data.id}.`,
                    data: data
                });
            }
        });
    }
    ,
    delete: (userId, callback) => {
        logger.info('delete user', userId)
        database.delete(userId, (err, data) => {
            if (err) {
                logger.info(
                    'error deleting user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User deleted with id ${data.id}.`)
                callback(null, {
                    message: `User deleted with id ${data.id}.`,
                    data: data
                })
            }
        })
    },
    update: (userId, user, callback) => {
        logger.info('update user', userId)
        database.update(userId, user, (err, data) => {
            if (err) {
                logger.info(
                    'error updating user: ',
                    err.message || 'unknown error'
                )
                callback(err, null)
            } else {
                logger.trace(`User updated with id ${data.id}.`)
                callback(null, {
                    message: `User updated with id ${data.id}.`,
                    data: data
                })
            }
        })
    }
}

module.exports = userService
