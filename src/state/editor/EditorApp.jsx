// EditorApp.jsx - Main React application component
// Note: This file is loaded via script tag, so no import statements

const EditorApp = () => {
  const [configs, setConfigs] = React.useState({})
  const [selectedConfig, setSelectedConfig] = React.useState(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  // List of available configurations
  const configList = [
    'jrc', 'jrc-themed', 'jrc-birthday', 'jrc-endurance', 'jrc-historic',
    'jrc-modern', 'jrc-placement', 'jrc-rbr', 'jrc-rbr-rallysprint',
    'jrc-worldcup', 'jrc-wrc', 'oor', 'rsc', 'test', 'test-e2e'
  ]

  React.useEffect(() => {
    loadAllConfigs()
  }, [])

  const loadAllConfigs = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const loadedConfigs = {}
      
      for (const configName of configList) {
        try {
          const response = await fetch(`/api/state/${configName}/initialState`)
          if (response.ok) {
            const config = await response.json()
            loadedConfigs[configName] = config
          }
        } catch (err) {
          console.warn(`Failed to load ${configName}:`, err.message)
        }
      }
      
      setConfigs(loadedConfigs)
    } catch (err) {
      setError(`Failed to load configurations: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadConfig = async (configName) => {
    try {
      const response = await fetch(`/api/state/${configName}/initialState`)
      if (response.ok) {
        const config = await response.json()
        setConfigs(prev => ({
          ...prev,
          [configName]: config
        }))
        return config
      } else {
        throw new Error(`Failed to load ${configName}`)
      }
    } catch (err) {
      setError(`Failed to load ${configName}: ${err.message}`)
      return null
    }
  }

  const saveConfig = async (configName, config) => {
    try {
      const response = await fetch(`/api/state/${configName}/initialState`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        setConfigs(prev => ({
          ...prev,
          [configName]: config
        }))
        return true
      } else {
        throw new Error(`Failed to save ${configName}`)
      }
    } catch (err) {
      setError(`Failed to save ${configName}: ${err.message}`)
      return false
    }
  }

  const handleEditConfig = async (configName) => {
    let config = configs[configName]
    
    if (!config) {
      config = await loadConfig(configName)
      if (!config) return
    }
    
    setSelectedConfig({ name: configName, data: config })
    setIsEditing(true)
  }

  const handleSaveConfig = async (config) => {
    const success = await saveConfig(selectedConfig.name, config)
    if (success) {
      setIsEditing(false)
      setSelectedConfig(null)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedConfig(null)
  }

  const generateJavaScript = (config) => {
    // Convert the config object back to JavaScript format
    const jsString = `const initialState = ${JSON.stringify(config, null, 2)};

module.exports = initialState;`
    
    return jsString
  }

  const downloadConfig = (configName, config) => {
    const jsContent = generateJavaScript(config)
    const blob = new Blob([jsContent], { type: 'application/javascript' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${configName}-initialState.js`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="editor-app">
        <div className="loading">
          <h2>Loading configurations...</h2>
        </div>
      </div>
    )
  }

  if (isEditing && selectedConfig) {
    return (
      <InitialStateEditor
        initialState={selectedConfig.data}
        onSave={handleSaveConfig}
        onCancel={handleCancelEdit}
      />
    )
  }

  return (
    <div className="editor-app">
      <div className="app-header">
        <h1>Initial State Configuration Manager</h1>
        <button onClick={loadAllConfigs} className="refresh-button">
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          <h4>Error:</h4>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="config-list">
        <h2>Available Configurations</h2>
        <div className="config-grid">
          {configList.map(configName => {
            const config = configs[configName]
            const hasConfig = !!config
            
            return (
              <div key={configName} className={`config-card ${hasConfig ? 'loaded' : 'not-loaded'}`}>
                <div className="config-header">
                  <h3>{configName}</h3>
                  <div className="config-status">
                    {hasConfig ? '✓ Loaded' : '⚠ Not Loaded'}
                  </div>
                </div>
                
                {config && (
                  <div className="config-info">
                    <p><strong>Website:</strong> {config.websiteName || 'N/A'}</p>
                    <p><strong>Divisions:</strong> {Object.keys(config.divisions || {}).length}</p>
                    <p><strong>Historical Links:</strong> {(config.historicalSeasonLinks || []).length}</p>
                  </div>
                )}
                
                <div className="config-actions">
                  <button 
                    onClick={() => handleEditConfig(configName)}
                    className="edit-button"
                    disabled={!hasConfig}
                  >
                    Edit
                  </button>
                  
                  {config && (
                    <button 
                      onClick={() => downloadConfig(configName, config)}
                      className="download-button"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="help-section">
        <h2>How to Use</h2>
        <ol>
          <li>Click "Edit" on any loaded configuration to open the editor</li>
          <li>Make changes using the form fields</li>
          <li>Click "Save" to save your changes</li>
          <li>Use "Download" to export the configuration as a JavaScript file</li>
          <li>Replace the original <code>initialState.js</code> file with the downloaded version</li>
        </ol>
      </div>
    </div>
  )
}

// EditorApp component is now ready to be used
