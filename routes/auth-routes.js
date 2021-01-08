const router = require('express').Router();
const passport = require('passport');

router.get('/login', (req, res) => {
    res.render('login', {user: req.user});
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/discord', passport.authenticate('discord', {
    scope: ['identify']
}));

router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.redirect('/');
});

module.exports = router;