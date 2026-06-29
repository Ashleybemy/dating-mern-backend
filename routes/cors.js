const cors = require('cors');

const whitelist = [
  'https://localhost:3000',
  'https://localhost:3443',
  'http://localhost:4200'
];

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  const corsOptions = whitelist.includes(origin)
    ? { origin: true }
    : { origin: false };

  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
