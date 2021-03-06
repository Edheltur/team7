import { Passport } from 'passport';
import { Strategy } from 'passport-github';
import config from '../config';
import loginUser from '../db/login-manager';
import getLogger from '../utils/logger';

const logger = getLogger('auth');

export const CALLBACK_PATH = '/login/return';

const saveUserAfterAuth = async ({ username, id }) => {
    logger.debug(`User from github: https://github.com/${username} (id=${id})`);
    return loginUser(id, username)
        .then(() => [null, { userId: id }], err => [err, null]);
};

const strategyOptions = {
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: config.SITE_URL + CALLBACK_PATH
};
const githubStrategy = new Strategy(strategyOptions, (accessToken, refreshToken, profile, done) => {
    saveUserAfterAuth(profile).then(args => done(...args));
});

export const passport = new Passport();

passport.use(githubStrategy);

// Определяем функцию для сохранения данных пользователя в сессию
passport.serializeUser((user, done) => {
    done(null, user);
});

// Определяем функцию для получения данных пользователя из сессии
passport.deserializeUser((user, done) => {
    done(null, user);
});

export const installPassport = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
};

