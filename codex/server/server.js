const path = require('path')
const express = require('express')
const jokesRoute = require('./routes')
const sequelize = require('./config/db')


const PORT = 5000
const app = express()
const staticFolder = path.join(__dirname, 'static')
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})
app.use(express.static(staticFolder))
app.use(express.json())

//Нашел это решение в интернете, чтобы обойти ошибку CORS

app.use('/', jokesRoute)

sequelize.authenticate()
  .then(() => {
    console.log('База данных подключена')

  }).catch((err) => {
  console.log(`Ошибка подключения к базе данных, ${err}`)
})

sequelize.sync({ alter: true })
  .then(() => {
    console.log('База данных синхронизирована')

  }).catch((err) => {
  console.log(`Ошибка синхронизации к базе данных, ${err}`)
})
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`)

})
