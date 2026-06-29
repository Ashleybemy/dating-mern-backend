function validateArticle(req, res, next) {
  const { title, date, author, content } = req.body;
  if (!title || !date || !author || !content) {
    return res.status(400).json({ message: 'title, date, author, and content are required' });
  }
  next();
}

function validateDate(field = 'date') {
  return (req, res, next) => {
    if (req.body[field] && Number.isNaN(Date.parse(req.body[field]))) {
      return res.status(400).json({ message: `${field} must be a valid date` });
    }
    next();
  };
}

function validateTextLength(field, min, max) {
  return (req, res, next) => {
    const value = req.body[field];
    if (typeof value !== 'string' || value.length < min || value.length > max) {
      return res.status(400).json({ message: `${field} must be ${min}-${max} characters` });
    }
    next();
  };
}

module.exports = { validateArticle, validateDate, validateTextLength };

