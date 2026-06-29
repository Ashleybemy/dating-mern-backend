function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
}

module.exports = { notFound, errorHandler };

