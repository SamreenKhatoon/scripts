#!/usr/bin/env node

console.log("Script called")

const path = require('path');
const fs = require('fs');

const scriptDir = __dirname;

console.log(scriptDir)

// Assuming the repository is installed in the `node_modules` directory
const repoDir = path.join(scriptDir, '..', '..');

console.log(repoDir)

// Assuming "src" is the source folder of the repository
const srcDir = path.join(repoDir, 'src');

console.log(srcDir)

// Check if the "src" directory exists within the repository
fs.stat(srcDir, (err, stats) => {
    if (err || !stats.isDirectory()) {
        console.log('Source directory not found for the installed repository.');
    } else {
        console.log(`Source directory of the installed repository is located at: ${srcDir}`);
    }
});