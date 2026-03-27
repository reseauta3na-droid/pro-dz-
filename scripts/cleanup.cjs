const fs = require('fs');
const path = require('path');

const dirsToClean = [
  'dist',
  'android/app/build',
  'android/.gradle'
];

console.log('Starting cleanup...');

dirsToClean.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Cleaning ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

console.log('Cleanup complete!');
