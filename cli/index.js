#!/usr/bin/env node

console.log("Script called")

const path = require('path');
const fs = require('fs');

const scriptDir = __dirname;

console.log(scriptDir)
const repoDir = path.join(scriptDir, '..', '..', '..');

console.log(repoDir)

const srcDir = path.join(repoDir, 'src');

console.log(srcDir)
