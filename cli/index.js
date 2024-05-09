#!/usr/bin/env node

// console.log("Script called")

// const path = require('path');

// const repoDir = path.join(__dirname, '..', '..', '..');

// console.log(repoDir)

// const srcDir = path.join(repoDir, 'src');

// console.log(srcDir)

const path = require('path');
console.log(path.dirname(require.main.filename));
