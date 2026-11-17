'use strict';

const express = require('express');
const { Database } = require('node:sqlite')
const migrate = require('./migrate')

const app = express();
const db = new Database('app.db')

db.exec('CREATE TABLE IF NOT EXISTS migrations (signature TEXT PRIMARY KEY, timestamp INTEGER)')

// simplest solution without a proper migration framework
// should be restricted in some way
// or replaced with a separate script
app.get('/migrate/up', (req, res) => {
  try {
    migrate.up(db)
    res.json({status: 'success'})
  } catch (e) {
    res.status(500).json({error: e})
  }
})

app.get('/migrate/down', (req, res) => {
  try {
    migrate.down(db)
    res.json({status: 'success'})
  } catch (e) {
    res.status(500).json({error: e})
  }
})

app.get('/jokebook/categories', (req, res) => {
  const getCategoryStmt = db.prepare('SELECT name FROM categories')
  const categories = getCategoryStmt.all()
  getCategoryStmt.close()
  res.json({categories: categories})
});

app.get('/jokebook/joke/:category', (req, res) => {
  const categoryName = req.params.category
  const getCategoriesStmt = db.prepare('SELECT * FROM categories WHERE name=?')
  const category = getCategoriesStmt.get(categoryName)
  getCategoriesStmt.close()

  if (!category) {
    res.status(404).json({error: `No jokes for category ${categoryName}`})
    return
  }

  const getRecordStmt = db.prepare('SELECT joke, response FROM jokes WHERE category_id=? ORDER BY RANDOM() LIMIT 1')
  const record = getRecordStmt.get(category.id)
  getRecordStmt.close()

  res.json(record)
})

app.get('/jokebook/categories/:category', (req, res) => {
  const categoryName = req.params.category
  const getCategoriesStmt = db.prepare('SELECT * FROM categories WHERE name=?')
  const category = getCategoriesStmt.get(categoryName)
  getCategoriesStmt.close()

  if (!category) {
    res.status(404).json({error: `No jokes for category ${categoryName}`})
    return
  }

  const getRecordsStmt = db.prepare('SELECT joke, response FROM jokes WHERE category_id=?')
  const records = getRecordsStmt.all(category.id)
  getRecordsStmt.close()

  res.json({jokes: records})
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});