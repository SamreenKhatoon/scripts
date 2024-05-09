#!/usr/bin/env node

const path = require('path');
console.log(__dirname.length);

let index = __dirname.indexOf('node_modules');
console.log(index)

let result = __dirname.substring(0, index);
console.log(result);
