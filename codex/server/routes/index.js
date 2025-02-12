const express = require('express')
const router = express.Router()
const getJokes = require('../controllers/jokes.js')
const jokeDB = require('../models/joke')
const getAllFiles = require('../controllers/files')
const path = require('path')
const fs = require('fs')


router.post('/save', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Анекдот не предоставлен.' });
  }
  await jokeDB.create({ text });
  console.log(`Сохранен анекдот: ${text}`);
  res.status(200).json({ message: 'Анекдот успешно сохранен!' });
});
router.get('/jokes', async (req, res) => {
  try {
    let result = await getJokes()
    res.send(result)
  } catch (error) {
    throw new Error('Ошибка получения анекдотов')
  }
})

router.get('/db', async (req, res) => {
  try {
    const jokes = await jokeDB.findAll({
      attributes: ['text'],
      limit: 5
    })
    res.json(jokes)
  } catch (error) {
    console.error(error)
    res.status(500).send('Ошибка загрузки анекдотов из базы данных')
  }
})
router.get('/', async (req, res) => {
  try {
    let result = await getAllFiles()
    res.send(result)
  } catch (error) {
    console.error(error)
    res.status(500).send('Ошибка чтения ')
  }
})
router.get('/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, 'files', filename)

  console.log(`Запрос к файлу: ${filename}`)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Ошибка при чтении файла: ${err.message}`)
      return res.status(500).send('Ошибка при чтении файла') // Завершаем обработку
    }
    const extname = path.extname(filename).toLowerCase()
    if (extname === '.html' || extname === '.txt') {
      res.send(data)
    } else if (extname === '.png') {
      res.sendFile(filePath)
    } else if (extname === '.json') {
      res.setHeader('Content-Type', 'application/json')
      res.send(data)
    } else {
      console.warn(`Неподдерживаемый формат файла - ${extname}`)
      return res.status(400).send('Неподдерживаемый формат файла') // Завершаем обработку
    }
  })
})

module.exports = router
