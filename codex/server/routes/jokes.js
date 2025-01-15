const express = require('express')
const router = express.Router()
const getJokes = require('../controllers/jokes.js')
router.get('/jokes', async (req, res) => {
  try {
    let result = await getJokes()
    res.send(result)
  } catch {
    throw new Error('Ошибка получения анекдотов')
  }
})
module.exports = router
