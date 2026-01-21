// app.js

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Создаем соединение с базой данных
const sequelize = new Sequelize('sqlite::memory:');

// Определяем модели
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

const Project = sequelize.define('Project', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// Определяем связь "Многие ко многим"
User.belongsToMany(Project, { through: 'UserProjects' });
Project.belongsToMany(User, { through: 'UserProjects' });

// Создаем приложение Express
const app = express();
app.use(express.json());

// Маршруты для проверки
app.get('/users', async (req, res) => {
    const users = await User.findAll({ include: Project });
    res.json(users);
});

app.get('/projects', async (req, res) => {
    const projects = await Project.findAll({ include: User });
    res.json(projects);
});

app.post('/users', async (req, res) => {
    const { name } = req.body;
    const user = await User.create({ name });
    res.json(user);
});

app.post('/projects', async (req, res) => {
    const { title } = req.body;
    const project = await Project.create({ title });
    res.json(project);
});

app.post('/assign', async (req, res) => {
    const { userId, projectId } = req.body;
    const user = await User.findByPk(userId);
    const project = await Project.findByPk(projectId);

    if (user && project) {
        await user.addProject(project); // Связываем пользователя с проектом
        res.json({ message: 'User assigned to project successfully.' });
    } else {
        res.status(404).json({ message: 'User or Project not found.' });
    }
});

// Запуск сервера
const startServer = async () => {
    try {
        await sequelize.sync({ force: true }); // Синхронизация с базой данных
        console.log('Database synchronized.');

        // Создаем тестовые данные
        const user1 = await User.create({ name: 'John Doe' });
        const user2 = await User.create({ name: 'Jane Doe' });
        const project1 = await Project.create({ title: 'Project A' });
        const project2 = await Project.create({ title: 'Project B' });

        // Привязываем пользователей к проектам
        await user1.addProject(project1);
        await user2.addProject(project2);

        app.listen(3000, () => {
            console.log('Server is running on http://localhost:3000');
        });
    } catch (error) {
        console.error('Error starting the server:', error);
    }
};

startServer();
