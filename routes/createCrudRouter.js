const express = require('express');
const { readDb, writeDb, nextId } = require('../storage');

function createCrudRouter(collectionName, validators = []) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const db = await readDb();
      res.json(db[collectionName]);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const db = await readDb();
      const item = db[collectionName].find((entry) => entry.id === Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: `${collectionName} item not found` });
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', validators, async (req, res, next) => {
    try {
      const db = await readDb();
      const item = { id: nextId(db[collectionName]), comments: [], ...req.body };
      db[collectionName].push(item);
      await writeDb(db);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', validators, async (req, res, next) => {
    try {
      const db = await readDb();
      const index = db[collectionName].findIndex((entry) => entry.id === Number(req.params.id));
      if (index === -1) {
        return res.status(404).json({ message: `${collectionName} item not found` });
      }
      db[collectionName][index] = { ...db[collectionName][index], ...req.body, id: Number(req.params.id) };
      await writeDb(db);
      res.json(db[collectionName][index]);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const db = await readDb();
      const index = db[collectionName].findIndex((entry) => entry.id === Number(req.params.id));
      if (index === -1) {
        return res.status(404).json({ message: `${collectionName} item not found` });
      }
      const [deleted] = db[collectionName].splice(index, 1);
      await writeDb(db);
      res.json(deleted);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createCrudRouter;

