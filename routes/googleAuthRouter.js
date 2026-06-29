const express = require('express');
const { hasGoogleConfig, passport } = require('../config/facebookOAuth');
const { createToken } = require('../middleware/jwtAuth');

const googleAuthRouter = express.Router();

function requireGoogleConfig(req, res, next) {
  if (hasGoogleConfig()) {
    return next();
  }

  return res.status(500).json({
    message: 'Google OAuth is not configured',
    requiredEnv: [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ],
    callbackUrl: process.env.GOOGLE_CALLBACK_URL
      || 'https://localhost:3000/auth/google/callback'
  });
}

googleAuthRouter.get(
  '/google',
  requireGoogleConfig,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

googleAuthRouter.get(
  '/google/callback',
  requireGoogleConfig,
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = createToken(req.user, 'google');

    res.json({
      message: 'Google login successful',
      user: {
        googleId: req.user.id,
        username: req.user.displayName
      },
      token
    });
  }
);

module.exports = googleAuthRouter;
