
const fs = require('fs');
const path = require('path');

const url = 'https://cxdDhruv.github.io/Examora/';
const shortcutName = 'Examora App.url';
const desktopPath = path.join(process.env.USERPROFILE, 'Desktop', shortcutName);

// Content of .url file
const fileContent = `[InternetShortcut]\nURL=${url}\nIconIndex=0\nIconFile=${path.resolve('src/assets/favicon.ico') || ''}`; // Attempts to use favicon if available, else generic.

fs.writeFileSync(desktopPath, fileContent);
console.log(`Shortcut created at: ${desktopPath}`);
