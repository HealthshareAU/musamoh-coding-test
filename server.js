const express = require('express');
const {check, validationResult} = require('express-validator/check');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 9001;

let existingUsers = {
    9: {
        firstName: 'Billy',
        email: 'billy@gmail.com',
        password: 'ilikeicecream123'
    },
    2: {
        firstName: 'Jimmy',
        email: 'jimmy@gmail.com',
        password: 'iamnotfondoficecream1234'
    },
};

const userValidation = [
    check(
        'firstName'
    ).exists().withMessage('You must include a first name'),
    check('email').isEmail().withMessage('Must include email'),
    check(
        'password'
    ).isLength({min: 8}).withMessage('Password must be at least 8 characters'),
];

app.get('/api/home/', (request, response) => {
    response.send({content: 'Hello From Server'})
});


app.get('/api/get-user/:id([0-9]{1})', (request, response) => {
    const id = request.params.id;
    let user = null;
    try {
        user = existingUsers[id];
    } catch(err) {
        response.status(404).send({errors: ['User not found']});
    }

    response.send({user})
});

app.post('/api/users/', userValidation, (request, response) => {
    const errors = validationResult(request);
    if(!errors.isEmpty()) {
        response.status(404).send({errors: errors.mapped()});
        return;
    }

    const user = {
        firstName: request.body.firstName,
        email: request.body.email,
        password: request.body.password,
    };
    const id = Math.floor(Math.random() * 20);
    existingUsers[id] = user;

    response.send({
        user,
        message: 'User created successfully',
        id,
    })
});


module.exports = app.listen(
    port, () => console.log(`Listening on port ${port}`));
