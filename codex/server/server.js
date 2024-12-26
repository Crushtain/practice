
import fs from "fs"
import path from "path"
import {fileURLToPath} from 'url';
import express from 'express'

// Создаем приложение Express
const app = express();
const PORT = 3000;

// Определяем папку со статическими файлами
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolder = path.join(__dirname, 'static');

// Настраиваем маршрут для статических файлов
app.use(express.static(staticFolder));

// Главный маршрут, который будет обрабатывать запросы
app.get('*', (req, res) => {
    const fileName = req.params[0]; // Получаем имя файла из URL
    const filePath = path.join(staticFolder, fileName);

    // Если имя файла пустое, показываем список файлов
    if (!fileName || fileName === '/') {
        fs.readdir(staticFolder, (err, files) => {
            if (err) {
                return res.status(500).send('Ошибка при чтении папки');
            }
            // Создаем HTML-страницу со списком файлов
            let fileLinks = files.map(file => `<button onclick="location.href='/${file}'">${file}</button>`).join('<br>');
            res.send(`<h1>Список файлов:</h1>${fileLinks}`);
        });
    } else {
        // Проверяем наличие запрашиваемого файла
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('404 Файл не найден');
            }
            // fs.readFile(filePath, 'utf-8', (err, data) => {
            //     if (err) {
            //         return res.status(500).send('Ошибка чтения файла');
            //     }
            //     res.send(`<pre>${data}</pre>`);
            // })
            res.sendFile(path.join(staticFolder,'index.html'), (err) => {
                if (err) {
                    return res.status(500).send('Ошибка при отправке файла');
                }
            });
        });
    }
});

// Запускаем сервер
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});