const fs = require('fs');
const ignoreFilePath = '.stylelintignore';

// Читаем содержимое файла .stylelintignore
const currentIgnoreList = fs.readFileSync(ignoreFilePath, 'utf-8').trim().split('\n');

// Создаем новый список для игнорирования файлов
let newIgnoreList = [];

// Проходим по каждому файлу в текущем списке
for (const file of currentIgnoreList) {
  // Проверяем, является ли элемент файлом (а не директорией)
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    // Проверяем, содержит ли файл комментарий, отключающий линтинг на весь файл
    const fileContent = fs.readFileSync(file, 'utf-8').trim();
    
    if (!fileContent.startsWith('/* stylelint-disable */') && !fileContent.includes('\n/* stylelint-disable-next-line */')) {
      // Если файл не содержит комментария, отключающего линтинг, то добавляем его в новый список
      newIgnoreList.push(file);
    }
  }
}

// Если новый список пустой, то не создаем новый файл .stylelintignore
if (newIgnoreList.length === 0) {
  console.log('Нет файлов для игнорирования');
} else {
  // Считываем прошлый размер файла
  const oldIgnoreContent = fs.readFileSync(ignoreFilePath, 'utf-8').trim();
  const oldIgnoreSize = Buffer.byteLength(oldIgnoreContent, 'utf8');
  
  // Создаем новый файл .stylelintignore и записываем в него новый список
  const newIgnoreContent = newIgnoreList.join('\n');
  fs.writeFileSync(ignoreFilePath, newIgnoreContent);
  console.log(`Файл .stylelintignore был перезаписан. Старый размер файла: ${oldIgnoreSize} байт. Новый размер файла: ${Buffer.byteLength(newIgnoreContent, 'utf8')} байт.`);
}
