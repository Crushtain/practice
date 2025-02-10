const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)

async function getAllFiles(staticFolder) {
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
