const fs = require('fs');
const path = require('path');

require('dotenv').config({
  path: fs.existsSync(path.join(__dirname, '.env'))
    ? path.join(__dirname, '.env')
    : path.join(__dirname, '.env.example')
});

const https = require('https');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { engine } = require('express-handlebars');
const articleRouter = require('./routes/articleRouter');
const facebookAuthRouter = require('./routes/facebookAuthRouter');
const googleAuthRouter = require('./routes/googleAuthRouter');
const uploadRouter = require('./routes/uploadRouter');
const videoRouter = require('./routes/videoRouter');
const { readDb } = require('./storage');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { passport } = require('./config/facebookOAuth');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const isProduction = process.env.NODE_ENV === 'production';
const httpPort = process.env.PORT || process.env.HTTP_PORT || 3001;
const httpsPort = process.env.HTTPS_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'oauth-demo-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials'),
  defaultLayout: 'main',
  helpers: {
    formatDate(value) {
      return new Intl.DateTimeFormat('en-US').format(new Date(value));
    }
  }
}));

app.get('/', async (req, res, next) => {
  try {
    const db = await readDb();
    res.render('pages/index', {
      tagline: 'News, videos, and Express templates in one exercise app.',
      mascots: [
        { name: 'Sammy', organization: 'DigitalOcean', birth_year: 2012 },
        { name: 'Tux', organization: 'Linux', birth_year: 1996 },
        { name: 'Moby Dock', organization: 'Docker', birth_year: 2013 }
      ],
      articles: db.articles
    });
  } catch (error) {
    next(error);
  }
});

app.get('/about', (req, res) => {
  res.render('pages/about', { variant: 'compact' });
});

app.get('/hbs', async (req, res, next) => {
  try {
    const db = await readDb();
    res.render('home.handlebars', {
      layout: 'main',
      title: 'News Home',
      message: 'Welcome to the Handlebars news website.',
      articles: db.articles
    });
  } catch (error) {
    next(error);
  }
});

app.get('/hbs/articles/:id', async (req, res, next) => {
  try {
    const db = await readDb();
    const article = db.articles.find((item) => item.id === Number(req.params.id));
    if (!article) {
      return res.status(404).render('article.handlebars', { layout: 'main', title: 'Not Found' });
    }
    res.render('article.handlebars', { layout: 'main', title: article.title, article });
  } catch (error) {
    next(error);
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.status(201).json({
    message: 'File uploaded',
    file: req.file
  });
});

app.get('/download/:filename', (req, res, next) => {
  const safeName = path.basename(req.params.filename);
  const filePath = path.join(__dirname, 'uploads', safeName);
  res.download(filePath, safeName, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.get('/download', (req, res) => {
  const filePath = req.query.filePath;

  if (!filePath) {
    return res.status(400).json({ message: 'filePath query parameter is required' });
  }

  const requestedPath = path.normalize(filePath);
  const safePath = path.resolve(__dirname, 'public', 'images', requestedPath);
  const imagesPath = path.resolve(__dirname, 'public', 'images');

  if (safePath !== imagesPath && !safePath.startsWith(`${imagesPath}${path.sep}`)) {
    return res.status(403).json({ message: 'Invalid file path.' });
  }

  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ message: 'File does not exist.' });
  }

  return res.download(safePath);
});

app.get('/login', (req, res) => {
  res.send([
    '<a href="/auth/facebook">Login with Facebook</a>',
    '<br>',
    '<a href="/auth/google">Login with Google</a>'
  ].join(''));
});

app.get('/oauth/success', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  res.json({
    message: 'Welcome to your application!',
    user: {
      facebookId: req.user.id,
      username: req.user.displayName
    }
  });
});

app.use('/auth', facebookAuthRouter);
app.use('/auth', googleAuthRouter);
app.use('/imageUpload', uploadRouter);
app.use('/articles', articleRouter);
app.use('/api/articles', articleRouter);
app.use('/api/videos', videoRouter);
app.use(notFound);
app.use(errorHandler);

if (isProduction) {
  app.listen(httpPort, () => {
    console.log(`Express app running on port ${httpPort}`);
  });
} else {
  app.listen(process.env.HTTP_PORT || 3001, () => {
    console.log(`Express app running at http://localhost:${process.env.HTTP_PORT || 3001}`);
  });

  const keyPath = path.join(__dirname, 'certs', 'key.pem');
  const certPath = path.join(__dirname, 'certs', 'cert.pem');
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, app)
      .listen(httpsPort, () => console.log(`HTTPS running at https://localhost:${httpsPort}`));
  }
}
