const express = require('express');
const userRoutes = require('./src/routes/user.routes');
const mealRoutes = require('./src/routes/meal.routes');
const authRoutes = require('./src/routes/authentication.routes').routes;
const participationRoutes = require('./src/routes/participation.routes');
const logger = require('./src/util/logger');
const cors = require('cors');

const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// Enable CORS if necessary
app.use(cors());

const port = process.env.PORT || 3000;

// Example simple route
app.get('/api/info', (req, res) => {
    console.log('GET /api/info');
    const info = {
        studentName: 'Stef Rensma',
        studentNumber: '2217058',
        description: 'This is a simple api server for a meal planner.'
    };
    res.json(info);
});

// Register routes
app.use(userRoutes);
app.use(mealRoutes);
app.use(participationRoutes);
app.use('/api/auth', authRoutes);

// Route error handler
app.use((req, res, next) => {
    next({
        status: 404,
        message: 'Route not found',
        data: {}
    });
});

// Express error handler
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        data: {}
    });
});

// Start the server
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

// Export the app for testing
module.exports = app;
