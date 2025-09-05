#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building DocStar SDK...');

// Minify search SDK
const inputFile = 'scripts/search-sdk/search-sdk.script.js';
const outputFile = 'scripts/search-sdk/search-sdk.script.min.js';

try {
  execSync(`terser ${inputFile} -o ${outputFile} --compress --mangle`, { stdio: 'inherit' });
  
  const originalSize = fs.statSync(inputFile).size;
  const minifiedSize = fs.statSync(outputFile).size;
  const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
  
  console.log('✅ Minification complete!');
  console.log(`📊 Original: ${originalSize} bytes`);
  console.log(`📊 Minified: ${minifiedSize} bytes`);
  console.log(`📊 Reduction: ${reduction}%`);
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
