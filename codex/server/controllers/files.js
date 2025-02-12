const path = require('path');
const fs = require('fs');
const util = require('util');

const staticFolder = path.join(__dirname, '..', 'static');

const readdir = util.promisify(fs.readdir);

async function getAllFiles() {
  try {
    const files = await readdir(staticFolder)
    let fileLinks = files
      .map(
        (file) => `<button onclick="location.href='/${file}'">${file}</button>`
      )
      .join('<br>')
    return `<h1>Список файлов:</h1>${fileLinks}`
  } catch (error) {
    throw new Error('Ошибка при чтении папки')
  }
}

module.exports = getAllFiles
