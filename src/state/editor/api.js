const express = require('express')
const path = require('path')
const fs = require('fs')
const { validateInitialState } = require('./schema/validator')

const router = express.Router()

// Get all available configurations
router.get('/configs', (req, res) => {
  const stateDir = path.join(__dirname, '..')
  const configs = []
  
  try {
    const subdirs = fs.readdirSync(stateDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
    
    for (const subdir of subdirs) {
      const initialStatePath = path.join(stateDir, subdir, 'initialState.js')
      if (fs.existsSync(initialStatePath)) {
        configs.push({
          name: subdir,
          path: initialStatePath,
          exists: true
        })
      }
    }
    
    res.json(configs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a specific configuration
router.get('/:configName/initialState', (req, res) => {
  const { configName } = req.params
  const initialStatePath = path.join(__dirname, '..', configName, 'initialState.js')
  
  if (!fs.existsSync(initialStatePath)) {
    return res.status(404).json({ error: 'Configuration not found' })
  }
  
  try {
    // Read and evaluate the JavaScript file
    const fileContent = fs.readFileSync(initialStatePath, 'utf8')
    
    // Create a safe evaluation context
    const context = {
      module: { exports: {} },
      require: (id) => {
        // Mock require for dependencies
        if (id.includes('shared')) {
          return { privateer: 'privateer' }
        }
        return {}
      }
    }
    
    // Evaluate the file in the context
    const func = new Function('module', 'require', fileContent)
    func(context.module, context.require)
    
    const config = context.module.exports
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: `Failed to parse configuration: ${error.message}` })
  }
})

// Save a configuration
router.post('/:configName/initialState', (req, res) => {
  const { configName } = req.params
  const config = req.body
  
  // Validate the configuration
  const validation = validateInitialState(config)
  if (!validation.isValid) {
    return res.status(400).json({ 
      error: 'Invalid configuration', 
      details: validation.errors 
    })
  }
  
  const initialStatePath = path.join(__dirname, '..', configName, 'initialState.js')
  
  try {
    // Ensure the directory exists
    const dir = path.dirname(initialStatePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Generate the JavaScript content
    const jsContent = generateJavaScriptFile(config)
    
    // Write the file
    fs.writeFileSync(initialStatePath, jsContent, 'utf8')
    
    res.json({ success: true, message: 'Configuration saved successfully' })
  } catch (error) {
    res.status(500).json({ error: `Failed to save configuration: ${error.message}` })
  }
})

// Validate a configuration
router.post('/validate', (req, res) => {
  const config = req.body
  const validation = validateInitialState(config)
  
  res.json({
    isValid: validation.isValid,
    errors: validation.errors
  })
})

// Generate JavaScript file content
function generateJavaScriptFile(config) {
  // Convert the config object to a nicely formatted JavaScript string
  const jsString = `const initialState = ${JSON.stringify(config, null, 2)};

module.exports = initialState;`
  
  return jsString
}

module.exports = router
