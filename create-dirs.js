const fs = require('fs');
const path = require('path');

const dirs = [
  'uploads',
  'uploads/animais'
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Pasta criada: ${dir}`);
  }
});

console.log('✅ Estrutura de pastas verificada!');
