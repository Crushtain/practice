const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Joke = sequelize.define(
  'Joke',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'jokes',
    timestamps: false,
  },
)

module.exports = Joke
