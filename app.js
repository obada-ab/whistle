const express = require('express');
const authRouter = require('./routes/auth-routes');
const cardRouter = require('./routes/card-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const passport = require('passport');
const Card = require('./models/card-model');

const PORT = 3333;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(express.json());

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/whistle',
    {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, () => {
    console.log('connected to mongodb');
});

app.use('/auth', authRouter);
app.use('/card', cardRouter);

const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else {
        next();
    }
}

app.get('/', authCheck, (req, res) => {
    Card.find().then(cards => {
        cards.reverse();
        res.render('index.ejs', {user: req.user});
    });
});

app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`);
});