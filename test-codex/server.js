const express = require('express')
const {Sequelize} = require('sequelize')
const {DataTypes} = require('sequelize')
const {v4: uuIdv4} = require('uuid')
const {reshape} = require("mathjs");

const app = express()
const port = 5000
app.use(express.json());
app.set('json spaces', 2);



const sequelize = new Sequelize(
    "postgres",
    "postgres",
    "12345",
    {
        host: "localhost",
        dialect: "postgres"
    }
)
const Point = sequelize.define('Point', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuIdv4(),
        primaryKey: true
    },
    x: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    y: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    temperature: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    humidity: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    humidityContent: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    specificHeat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    enthalpy: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    partialPressure: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    dewPoint: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    barometricPressure: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    calculationId: {
        type: DataTypes.UUID,
        allowNull: false
    }
})
const Calculation = sequelize.define('Calculation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuIdv4(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
})
const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.UUID,
        defaultValue: () => uuIdv4(),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})
const CalculationTag = sequelize.define('CalculationTag', {
    calculationId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: false
    }
})

Calculation.belongsToMany(Tag, {through: CalculationTag, foreignKey: 'calculationId',  otherKey: 'tagId'})
Tag.belongsToMany(Calculation, {through: CalculationTag, foreignKey: 'tagId', otherKey: 'calculationId'})

Calculation.hasMany(Point, {foreignKey: 'calculationId'})
Point.belongsTo(Calculation, {foreignKey: 'calculationId'})

sequelize.sync({alter: true})
    .then(() => {
        console.log('База данных подключена')
        console.log(Calculation.associations);
        console.log(Tag.associations);
    }).catch((err) => {
    console.log(`Ошибка подключения к базе данных, ${err}`)
})

app.get('/', async (req, res) => {
    console.log('Маршрут /api/calculations вызван');
    try {
        const calculations = await Calculation.findAll()
        res.json(calculations)
    } catch (err) {
        res.status(500).json({message: 'Ошибка при получении рассчетов'})
    }
})

app.post('/', async (req, res) => {
    const calculation = Calculation.create()
    calculation.addTag
})


app.listen(port, async () => {
    console.log(`Сервер запущен на http://localhost:${port}`)
})