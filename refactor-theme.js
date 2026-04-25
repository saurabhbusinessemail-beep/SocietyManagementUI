const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app');
const stylesDir = path.join(__dirname, 'src', 'styles');

function hexToRgbStr(hex) {
    if (!hex) return '0, 0, 0';
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

// 1. Refactor SCSS files
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
    
    // Replace rgba($color-name, 0.5) -> rgba(var(--color-name-rgb), 0.5)
    content = content.replace(/rgba\(\$([a-zA-Z0-9-]+)\s*,\s*([0-9.]+)\)/g, 'rgba(var(--$1-rgb), $2)');
    
    // Replace darken($color-name, 10%) -> color-mix(in srgb, var(--color-name), black 10%)
    content = content.replace(/darken\(\$([a-zA-Z0-9-]+)\s*,\s*([0-9.]+)%\)/g, 'color-mix(in srgb, var(--$1), black $2%)');
    
    // Replace lighten($color-name, 10%) -> color-mix(in srgb, var(--color-name), white 10%)
    content = content.replace(/lighten\(\$([a-zA-Z0-9-]+)\s*,\s*([0-9.]+)%\)/g, 'color-mix(in srgb, var(--$1), white $2%)');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

console.log('Refactoring SCSS color functions...');
processDirectory(srcDir);

// Do the same for files in styles/
processDirectory(stylesDir);
processFile(path.join(__dirname, 'src', 'styles.scss'));

// 2. Generate CSS Variables from themes
function extractVars(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};
    const regex = /^\$((?:color|status)-[a-zA-Z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
        vars[match[1]] = match[2];
    }
    return vars;
}

const baseVars = extractVars(path.join(stylesDir, '_variables.scss'));
const darkVars = extractVars(path.join(stylesDir, '_variables_theme_dark.scss'));
const emeraldVars = extractVars(path.join(stylesDir, '_variables_theme_emerald.scss'));
const oceanVars = extractVars(path.join(stylesDir, '_variables_theme_ocean.scss'));

let rootCss = `:root {\n`;
for (const [key, val] of Object.entries(baseVars)) {
    rootCss += `  --${key}: ${val};\n`;
    rootCss += `  --${key}-rgb: ${hexToRgbStr(val)};\n`;
}
rootCss += `}\n\n`;

function generateThemeCss(themeName, themeVars) {
    let css = `[data-theme="${themeName}"] {\n`;
    for (const [key, val] of Object.entries(themeVars)) {
        if (!val) continue;
        css += `  --${key}: ${val};\n`;
        css += `  --${key}-rgb: ${hexToRgbStr(val)};\n`;
    }
    css += `}\n\n`;
    return css;
}

rootCss += generateThemeCss('dark', darkVars);
rootCss += generateThemeCss('emerald', emeraldVars);
rootCss += generateThemeCss('ocean', oceanVars);

fs.writeFileSync(path.join(stylesDir, '_themes.scss'), rootCss, 'utf8');
console.log('Generated _themes.scss');

// 3. Update _variables.scss to map to CSS variables
let varsScss = fs.readFileSync(path.join(stylesDir, '_variables.scss'), 'utf8');
const replaceVarRegex = /^(\$((?:color|status)-[a-zA-Z0-9-]+))\s*:\s*(#[0-9a-fA-F]{3,6})/gm;
varsScss = varsScss.replace(replaceVarRegex, '$1: var(--$2)');
fs.writeFileSync(path.join(stylesDir, '_variables.scss'), varsScss, 'utf8');
console.log('Updated _variables.scss to use CSS vars');

// 4. Import _themes in styles.scss
let mainStyles = fs.readFileSync(path.join(__dirname, 'src', 'styles.scss'), 'utf8');
if (!mainStyles.includes('@import \'styles/themes\';')) {
    mainStyles = `@import 'styles/themes';\n` + mainStyles;
    fs.writeFileSync(path.join(__dirname, 'src', 'styles.scss'), mainStyles, 'utf8');
}
console.log('Done!');
