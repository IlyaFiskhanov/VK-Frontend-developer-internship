const fs = require('fs');
const path = require('path');
const glob = require('glob');
const stylelint = require('stylelint');

const ignoreFilePath = '.stylelintignore';

function readIgnoreList() {
  if (!fs.existsSync(ignoreFilePath)) {
    console.error(`${ignoreFilePath} не существует.`);
    return [];
  }
  return fs.readFileSync(ignoreFilePath, 'utf-8').trim().split('\n');
}

function lintFiles(files) {
  return stylelint.lint({ files, fix: true })
    .then(results => results.results.map(res => res.warnings).flat());
}

function extractErrorsByFilePath(errors) {
  const errorsByFilePath = {};
  for (const error of errors) {
    const filePath = error.source;
    const line = error.line;

    errorsByFilePath[filePath] = errorsByFilePath[filePath] || {};
    errorsByFilePath[filePath][line] = errorsByFilePath[filePath][line] || [];
    errorsByFilePath[filePath][line].push(error.rule);
  }
  return errorsByFilePath;
}

function addIgnoreDirectivesToFiles(errorsByFilePath) {
    function addIgnoreDirectivesToFiles(errorsByFilePath) {
        for (const filePath of Object.keys(errorsByFilePath)) {
          if (!fs.existsSync(filePath)) {
            console.error(`Файл не существует: ${filePath}`);
            continue;
          }
      
          const errorsByLine = errorsByFilePath[filePath];
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const lines = fileContent.split('\n');
      
          for (const [lineNum, lineErrors] of Object.entries(errorsByLine)) {
            const lineNumber = parseInt(lineNum, 10) - 1;
            const currentLine = lines[lineNumber];
            const ignoreComment = `/* stylelint-disable-next-line ${lineErrors.join(', ')} */`;
      
            if (!currentLine.includes(ignoreComment)) {
              lines[lineNumber] = `${currentLine} ${ignoreComment}`;
            }
          }
      
          fs.writeFileSync(filePath, lines.join('\n'));
        }
      }
      
}

function clearIgnoreFile() {
  fs.writeFileSync(ignoreFilePath, '');
}

function processFiles() {
  const ignoreList = readIgnoreList();
  const filesToLint = glob.sync('**/*.*', { ignore: ignoreList, nodir: true });

  return lintFiles(filesToLint)
    .then(extractErrorsByFilePath)
    .then(addIgnoreDirectivesToFiles)
    .then(clearIgnoreFile)
    .then(() => console.log('Скрипт выполнен успешно'))
    .catch(err => console.error(err));
}

processFiles();
