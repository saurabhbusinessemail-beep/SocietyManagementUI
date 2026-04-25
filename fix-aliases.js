const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');

const aliases = {
    'btn-bg-primary': 'color-dark-blue',
    'btn-bg-primary-light': 'color-light-blue',
    'btn-text-primary': 'color-white',
    'btn-bg-secondary': 'color-white',
    'btn-text-secondary': 'color-black',
    'btn-border-secondary': 'color-border'
};

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.scss')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    for (const [alias, base] of Object.entries(aliases)) {
        const regexRgb = new RegExp(`var\\(--${alias}-rgb\\)`, 'g');
        content = content.replace(regexRgb, `var(--${base}-rgb)`);
        
        const regexVar = new RegExp(`var\\(--${alias}\\)`, 'g');
        content = content.replace(regexVar, `var(--${base})`);
    }
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

processDirectory(srcDir);
console.log('Fixed aliases!');
