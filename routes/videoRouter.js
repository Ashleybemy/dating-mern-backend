const createCrudRouter = require('./createCrudRouter');
const { validateDate, validateTextLength } = require('../middleware/validateArticle');

module.exports = createCrudRouter('videos', [
  validateDate('date'),
  validateTextLength('content', 5, 2000)
]);

