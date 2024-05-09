#!/usr/bin/env node

const path = require('path');
// console.log(__dirname);

let index = __dirname.indexOf('node_modules');

let result = __dirname.substring(0, index + __dirname.length);
console.log(result);
