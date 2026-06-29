const fs = require('fs/promises');
const path = require('path');

const dataPath = path.join(__dirname, 'data.json');

async function readDb() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'));
}

async function writeDb(db) {
  await fs.writeFile(dataPath, JSON.stringify(db, null, 2));
  return db;
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

module.exports = { readDb, writeDb, nextId };

