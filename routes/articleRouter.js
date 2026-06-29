const express = require('express');
const createCrudRouter = require('./createCrudRouter');
const cors = require('./cors');
const { verifyWriteOperation } = require('../middleware/jwtAuth');
const { validateArticle, validateDate, validateTextLength } = require('../middleware/validateArticle');

const articleRouter = express.Router();
const crudRouter = createCrudRouter('articles', [
  validateArticle,
  validateDate('date'),
  validateTextLength('content', 10, 2000)
]);

articleRouter.use(cors.corsWithOptions);
articleRouter.options('*', cors.corsWithOptions);
articleRouter.use(verifyWriteOperation);
articleRouter.use(crudRouter);

module.exports = articleRouter;
