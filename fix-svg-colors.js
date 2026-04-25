const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');

function processIcons() {
    const files = fs.readdirSync(iconsDir);
    for (const file of files) {
        if (file.endsWith('.svg')) {
            const filePath = path.join(iconsDir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace hardcoded black/white with currentColor to allow theme inheritance
            const originalContent = content;
            content = content.replace(/fill="#000000"/gi, 'fill="currentColor"');
            content = content.replace(/stroke="#000000"/gi, 'stroke="currentColor"');
            
            // also `#fff` or `#ffffff` if they are meant to be icons
            // Wait, maybe not white, some icons might be two-tone. Let's just fix black for now.
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${file}`);
            }
        }
    }
}

processIcons();
console.log('Fixed SVG colors!');
