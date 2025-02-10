const fs = require('fs')
const path = require('path')
const express = require('express')
const getAllFiles = require('./controllers/files.js')
const jokesRoute = require('./routes/jokes')
const jokeDB = require('./models/joke')

const PORT = 5000
const app = express()
const staticFolder = path.join(__dirname, 'static')


//Нашел это решение в интернете, чтобы обойти ошибку CORS
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
app.use(express.static(staticFolder))
app.use('/', jokesRoute)

app.get('/db', async (req, res) => {
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
app.get('/', async (req, res) => {
  try {
    let result = await getAllFiles(staticFolder)
    res.send(result)
  } catch (error) {
    console.error(error)
    res.status(500).send('Ошибка чтения ')
  }
})
app.get('/:filename', (req, res) => {
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
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`)
})
