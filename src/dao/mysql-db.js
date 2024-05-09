const mysql = require('mysql2')
const logger = require('../../src/util/logger')
require('dotenv').config()

// Set the log level to the value of the LOG_LEVEL environment variable
// Only here to show how to set the log level
const tracer = require('tracer')
tracer.setLevel(process.env.LOG_LEVEL)

// Hier worden de db connection settings opgehaald uit de .env file
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true
}

logger.trace(dbConfig)

// Hier wordt de pool aangemaakt
const pool = mysql.createPool(dbConfig)

//
// Hier worden de events van de pool gelogd, zodat je kunt zien wat er gebeurt
//
pool.on('connection', function (connection) {
    logger.trace(
        `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
    )
})

pool.on('acquire', function (connection) {
    logger.trace('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    logger.trace('Connection %d released', connection.threadId)
})


// Export the pool, so that testcases can use it
module.exports = pool