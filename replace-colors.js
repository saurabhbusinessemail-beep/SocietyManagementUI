const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const variablesFile = path.join(srcDir, 'styles', '_variables.scss');

const varContent = fs.readFileSync(variablesFile, 'utf8');

// 1. Parse existing variables
const existingVars = {};
const varMatches = [...varContent.matchAll(/^\s*(\$[a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/gm)];

for (const match of varMatches) {
    const varName = match[1];
    let colorVal = match[2].toLowerCase().replace(/\s+/g, '');
    // normalize hex
    if (/^#[0-9a-f]{3}$/.test(colorVal)) {
        colorVal = '#' + colorVal[1] + colorVal[1] + colorVal[2] + colorVal[2] + colorVal[3] + colorVal[3];
    }
    if (!existingVars[colorVal]) {
        existingVars[colorVal] = varName;
    }
}

const newVars = {};
let newVarContent = '';
let varCounter = 1;

function getColorVar(color) {
    color = color.toLowerCase().replace(/\s+/g, '');
    if (/^#[0-9a-f]{3}$/.test(color)) {
        color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
    }
    
    if (existingVars[color]) {
        return existingVars[color];
    }
    
    if (!newVars[color]) {
        let safeName = color.replace('#', '').replace(/[^a-zA-Z0-9]/g, '-');
        let newName = `$color-${safeName}`;
        if (color.startsWith('rgba(')) {
             newName = `$color-rgba-${varCounter}`;
             varCounter++;
        }
        newVars[color] = newName;
        newVarContent += `\n${newName}: ${color};`;
    }
    
    return newVars[color];
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.scss') && fullPath !== variablesFile) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace hex
    const hexPattern = /(?<![a-zA-Z0-9_-])(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})(?![a-zA-Z0-9])/g;
    content = content.replace(hexPattern, (match, p1) => getColorVar(p1));
    
    // Replace rgba
    const rgbaPattern = /(?<![a-zA-Z0-9_-])(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\))/g;
    content = content.replace(rgbaPattern, (match, p1) => getColorVar(p1));
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.relative(srcDir, filePath)}`);
    }
}

processDirectory(srcDir);

if (newVarContent) {
    const updatedVarContent = varContent + '\n// Auto-generated colors' + newVarContent + '\n';
    fs.writeFileSync(variablesFile, updatedVarContent, 'utf8');
    console.log(`Updated _variables.scss with ${Object.keys(newVars).length} new variables.`);
}
