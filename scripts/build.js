#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building DocStar SDK...');

// Function to recursively find all .js files in a directory
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to minify a single file
function minifyFile(inputFile) {
  const dir = path.dirname(inputFile);
  const basename = path.basename(inputFile, '.js');
  const outputFile = path.join(dir, `${basename}.min.js`);
  
  try {
    console.log(`📦 Minifying: ${inputFile}`);
    execSync(`terser "${inputFile}" -o "${outputFile}" --compress --mangle`, { stdio: 'pipe' });
    
    const originalSize = fs.statSync(inputFile).size;
    const minifiedSize = fs.statSync(outputFile).size;
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.relative(process.cwd(), inputFile)}`);
    console.log(`   📊 ${originalSize} → ${minifiedSize} bytes (${reduction}% reduction)`);
    
    return { originalSize, minifiedSize, reduction: parseFloat(reduction) };
  } catch (error) {
    console.error(`❌ Failed to minify ${inputFile}:`, error.message);
    return null;
  }
}

try {
  // Find all JavaScript files in scripts directory
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const jsFiles = findJSFiles(scriptsDir);
  
  if (jsFiles.length === 0) {
    console.log('📭 No JavaScript files found in scripts directory');
    process.exit(0);
  }
  
  console.log(`🔍 Found ${jsFiles.length} JavaScript file(s) to minify:`);
  jsFiles.forEach(file => console.log(`   • ${path.relative(process.cwd(), file)}`));
  console.log('');
  
  // Minify all files
  let totalOriginal = 0;
  let totalMinified = 0;
  let successCount = 0;
  
  jsFiles.forEach(file => {
    const result = minifyFile(file);
    if (result) {
      totalOriginal += result.originalSize;
      totalMinified += result.minifiedSize;
      successCount++;
    }
  });
  
  // Summary
  console.log('\n🎉 Build Summary:');
  console.log(`✅ Successfully minified: ${successCount}/${jsFiles.length} files`);
  if (totalOriginal > 0) {
    const totalReduction = ((totalOriginal - totalMinified) / totalOriginal * 100).toFixed(1);
    console.log(`📊 Total size: ${totalOriginal} → ${totalMinified} bytes`);
    console.log(`📊 Total reduction: ${totalReduction}%`);
  }
  
  if (successCount < jsFiles.length) {
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
