const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { CLIENT_ORIGIN } = require('./config');
const bodyParser = require('body-parser');

const app = express();
const jsonParser = bodyParser.json();

app.use(morgan('common'));

app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.get('/', (req, res) => {
    return res.status(200)
        .json({
            users: [
                {
                    firstName: 'Lynsey',
                    lastName: 'Powell'
                },
                {
                    firstName: 'Adam',
                    lastName: 'Phillips'
                }
            ]
        });
});

app.post('/api/users', jsonParser, (req, res) => {
    console.log(req.body)
    res.json({
        message: 'successful post'
    })
})

app.listen(process.env.PORT || 8080);

module.exports = { app };