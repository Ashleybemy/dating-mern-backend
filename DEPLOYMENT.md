# MERN Deployment Setup Notes

## Backend: Heroku

1. Create a Heroku app.
2. Set config vars from `.env.example` as needed:
   - `NODE_ENV=production`
   - `SESSION_SECRET`
   - `JWT_SECRET`
   - OAuth keys and callback URLs
3. For production OAuth callbacks, replace localhost URLs with your deployed Heroku URL:
   - `FACEBOOK_CALLBACK_URL=https://<your-heroku-app>.herokuapp.com/auth/facebook/callback`
   - `GOOGLE_CALLBACK_URL=https://<your-heroku-app>.herokuapp.com/auth/google/callback`
4. Deploy:
   ```bash
   git add .
   git commit -m "prepare backend for deployment"
   git push heroku main
   ```

Heroku provides HTTPS at the platform edge. In production this app listens on `process.env.PORT` over HTTP, which is the expected Heroku runtime behavior.

## Frontend: Firebase Hosting

This repository folder is the Express backend. If you have a separate React frontend, initialize Firebase Hosting from that frontend folder and use its production build directory, usually `build` or `dist`.

Typical commands:

```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

## MongoDB Atlas

If you add MongoDB persistence later, create a MongoDB Atlas cluster, add a database user, allow your deployment IPs, and store the connection string in an environment variable such as `MONGODB_URI`.
