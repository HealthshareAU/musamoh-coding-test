const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 9001;

let existingUsers = {
    9: {
        firstName: 'Billy',
        email: 'billy@gmail.com',
        password: 'ilikeicecream123',
        favoriteFruit: 'Mango'
    },
    2: {
        firstName: 'Jimmy',
        email: 'jimmy@gmail.com',
        password: 'iamnotfondoficecream1234',
        favoriteFruit: 'Apple'
    },
};

const userValidation = [
    body('firstName')
        .exists()
        .withMessage('You must include a first name'),
    body('email')
        .isEmail()
        .withMessage('Must include email'),
    body('password')
        .isLength({min: 8})
        .withMessage('Password must be at least 8 characters'),
];

app.get('/api/home/', (request, response) => {
    response.json({content: 'Hello From Server'});
});

app.get('/api/get-user/:id([0-9]{1})', (request, response) => {
    const id = request.params.id;
    const user = existingUsers[id];
    
    if (!user) {
        return response.status(404).json({
            errors: [`User with ID ${id} not found`]
        });
    }
    
    return response.json({ user });
});

app.post('/api/users/', userValidation, (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
        return response.status(400).json({errors: errors.mapped()});
    }

    const user = {
        firstName: request.body.firstName,
        email: request.body.email,
        password: request.body.password,
        favoriteFruit: request.body.favoriteFruit || 'Apple', // Default to Apple if not provided
    };
    const id = Math.floor(Math.random() * 20);
    existingUsers[id] = user;

    return response.status(201).json({
        user,
        message: 'User created successfully',
        id,
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        errors: ['Internal Server Error']
    });
});

const server = app.listen(port, () => console.log(`Listening on port ${port}`))
    .on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy. Trying ${port + 1}...`);
            server.listen(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

module.exports = server;
