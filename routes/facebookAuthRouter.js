const express = require('express');
const { hasFacebookConfig, passport } = require('../config/facebookOAuth');
const { createToken } = require('../middleware/jwtAuth');

const facebookAuthRouter = express.Router();

function requireFacebookConfig(req, res, next) {
  if (hasFacebookConfig()) {
    return next();
  }

  return res.status(500).json({
    message: 'Facebook OAuth is not configured',
    requiredEnv: [
      'FACEBOOK_APP_ID',
      'FACEBOOK_APP_SECRET'
    ],
    callbackUrl: process.env.FACEBOOK_CALLBACK_URL
      || 'https://localhost:3000/auth/facebook/callback'
  });
}

facebookAuthRouter.get(
  '/facebook',
  requireFacebookConfig,
  passport.authenticate('facebook')
);

facebookAuthRouter.get(
  '/facebook/callback',
  requireFacebookConfig,
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    const token = createToken(req.user, 'facebook');

    res.json({
      message: 'Facebook login successful',
      user: {
        facebookId: req.user.id,
        username: req.user.displayName
      },
      token
    });
  }
);

module.exports = facebookAuthRouter;
