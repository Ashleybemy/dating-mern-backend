
const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const facebookAppId = process.env.FACEBOOK_APP_ID;
const facebookAppSecret = process.env.FACEBOOK_APP_SECRET;
const facebookCallbackUrl = process.env.FACEBOOK_CALLBACK_URL
  || 'https://localhost:3000/auth/facebook/callback';
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL
  || 'https://localhost:3000/auth/google/callback';

function hasFacebookConfig() {
  return Boolean(
    facebookAppId
    && facebookAppSecret
    && facebookAppId !== 'your_facebook_app_id'
    && facebookAppSecret !== 'your_facebook_app_secret'
  );
}

function hasGoogleConfig() {
  return Boolean(
    googleClientId
    && googleClientSecret
    && googleClientId !== 'your_google_client_id'
    && googleClientSecret !== 'your_google_client_secret'
  );
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

if (hasFacebookConfig()) {
  passport.use(new FacebookStrategy({
    clientID: facebookAppId,
    clientSecret: facebookAppSecret,
    callbackURL: facebookCallbackUrl,
    profileFields: ['id', 'displayName']
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));
}

if (hasGoogleConfig()) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));
}

module.exports = {
  hasFacebookConfig,
  hasGoogleConfig,
  passport
};
