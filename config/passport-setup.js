const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

function discord_avatar_to_url(id, avatar, discriminator) {
    if (avatar == null) {
        return `https://cdn.discordapp.com/embed/avatars/${discriminator%5}.png`
    }
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`
}

passport.use(
    new DiscordStrategy({
        clientID: keys.discord.clientID,
        clientSecret: keys.discord.clientSecret,
        callbackURL: '/auth/discord/redirect',
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({
            discordID: profile.id
        }).then((currentUser) => {
            if (currentUser) {
                currentUser.thumbnail = discord_avatar_to_url(profile.id, profile.avatar, profile.discriminator);
                currentUser.username = profile.username;
                currentUser.save();
                done(null, currentUser);
            } else {
                new User({
                    username: profile.username,
                    discordID: profile.id,
                    thumbnail: discord_avatar_to_url(profile.id, profile.avatar, profile.discriminator),
                }).save().then((newUser) => {
                    done(null, newUser);
                });
            }
        });
    })
)