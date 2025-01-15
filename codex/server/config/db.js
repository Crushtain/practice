const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('postgres', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
})

async function authenticateDB() {
  try {
    await sequelize.authenticate()
    console.log('База данных подключена')
  } catch (error) {
    console.log('Ошибка подключения к базе данных:', error)
  }
}

module.exports = {
  sequelize,
  authenticateDB,
}
