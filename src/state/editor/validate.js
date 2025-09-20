#!/usr/bin/env node

const { validateAllInitialStateFiles, formatValidationErrors } = require('./schema/validator')

console.log('🔍 Validating all initialState.js files...\n')

const results = validateAllInitialStateFiles()

let totalFiles = 0
let validFiles = 0
let invalidFiles = 0

results.forEach(result => {
  totalFiles++
  
  if (result.isValid) {
    validFiles++
    console.log(`✅ ${result.filePath.split('/').slice(-2).join('/')} - Valid`)
  } else {
    invalidFiles++
    console.log(`❌ ${result.filePath.split('/').slice(-2).join('/')} - Invalid`)
    console.log(formatValidationErrors(result.errors))
    console.log('')
  }
})

console.log('\n📊 Validation Summary:')
console.log(`Total files: ${totalFiles}`)
console.log(`Valid: ${validFiles}`)
console.log(`Invalid: ${invalidFiles}`)

if (invalidFiles > 0) {
  console.log('\n⚠️  Some files have validation errors. Please fix them before proceeding.')
  process.exit(1)
} else {
  console.log('\n🎉 All files are valid!')
  process.exit(0)
}
