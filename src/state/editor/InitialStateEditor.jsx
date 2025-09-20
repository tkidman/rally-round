// InitialStateEditor.jsx - Editor component for individual configurations
// Note: This file is loaded via script tag, so no import statements

const InitialStateEditor = ({ initialState, onSave, onCancel }) => {
  const [config, setConfig] = React.useState(initialState || {})
  const [errors, setErrors] = React.useState([])
  const [activeTab, setActiveTab] = React.useState('general')

  // Basic configuration fields
  const generalFields = [
    { key: 'pointsForDNF', type: 'boolean', label: 'Points for DNF' },
    { key: 'websiteName', type: 'string', label: 'Website Name' },
    { key: 'subfolderName', type: 'string', label: 'Subfolder Name' },
    { key: 'useStandingsForHome', type: 'boolean', label: 'Use Standings for Home' },
    { key: 'showLivePoints', type: 'boolean', label: 'Show Live Points' },
    { key: 'showLivePointsDaysRemaining', type: 'number', label: 'Live Points Days Remaining' },
    { key: 'hideCarColumnInStandings', type: 'boolean', label: 'Hide Car Column in Standings' },
    { key: 'showCarNameAsTextInResults', type: 'boolean', label: 'Show Car Name as Text in Results' },
    { key: 'showCarNameAsTextInStandings', type: 'boolean', label: 'Show Car Name as Text in Standings' },
    { key: 'nullTeamIsPrivateer', type: 'boolean', label: 'Null Team is Privateer' },
    { key: 'useCarAsTeam', type: 'boolean', label: 'Use Car as Team' },
    { key: 'useCarClassAsTeam', type: 'boolean', label: 'Use Car Class as Team' },
    { key: 'useNationalityAsTeam', type: 'boolean', label: 'Use Nationality as Team' },
    { key: 'disableOverall', type: 'boolean', label: 'Disable Overall' },
    { key: 'teamPointsForPowerstage', type: 'boolean', label: 'Team Points for Powerstage' },
    { key: 'dropLowestScoringRoundsNumber', type: 'number', label: 'Drop Lowest Scoring Rounds' },
    { key: 'sortByDropRoundPoints', type: 'boolean', label: 'Sort by Drop Round Points' },
    { key: 'usePercentageForPromotionRelegationZones', type: 'boolean', label: 'Use Percentage for Promotion/Relegation' },
    { key: 'incorrectCarTimePenaltySeconds', type: 'number', label: 'Incorrect Car Time Penalty (seconds)' },
    { key: 'backgroundStyle', type: 'textarea', label: 'Background Style (CSS)' },
    { key: 'logo', type: 'string', label: 'Logo Filename' },
    { key: 'siteTitlePrefix', type: 'string', label: 'Site Title Prefix' },
    { key: 'superRallyIsDnf', type: 'boolean', label: 'Super Rally is DNF' },
    { key: 'showSuperRallyColumn', type: 'boolean', label: 'Show Super Rally Column' },
    { key: 'hideStageTimesUntilEventEnd', type: 'boolean', label: 'Hide Stage Times Until Event End' },
    { key: 'noSuperRallyPointsMultiplier', type: 'number', label: 'No Super Rally Points Multiplier' },
    { key: 'afterDropRoundMessage', type: 'textarea', label: 'After Drop Round Message' },
    { key: 'showTeamNameTextColumn', type: 'boolean', label: 'Show Team Name Text Column' },
    { key: 'hideTeamLogoColumn', type: 'boolean', label: 'Hide Team Logo Column' },
    { key: 'enableDnsPenalty', type: 'boolean', label: 'Enable DNS Penalty' },
    { key: 'dnsPenaltyFromFirstRound', type: 'boolean', label: 'DNS Penalty from First Round' },
    { key: 'numPointsForDebutant', type: 'number', label: 'Points for Debutant' }
  ]

  const handleFieldChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayFieldChange = (key, index, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) => i === index ? value : item)
    }))
  }

  const handleAddArrayItem = (key, defaultValue) => {
    setConfig(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), defaultValue]
    }))
  }

  const handleRemoveArrayItem = (key, index) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index)
    }))
  }

  const handleObjectFieldChange = (key, subKey, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [subKey]: value
      }
    }))
  }

  const renderField = (field) => {
    const value = config[field.key] || ''

    switch (field.type) {
      case 'boolean':
        return (
          <div key={field.key} className="field-group">
            <label>{field.label}</label>
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.key} className="field-group">
            <label>{field.label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.key, parseInt(e.target.value) || 0)}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.key} className="field-group">
            <label>{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              rows={4}
            />
          </div>
        )

      default:
        return (
          <div key={field.key} className="field-group">
            <label>{field.label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
            />
          </div>
        )
    }
  }

  const renderDivisions = () => {
    const divisions = config.divisions || {}
    
    return (
      <div className="divisions-section">
        <h3>Divisions</h3>
        {Object.keys(divisions).map(divisionKey => (
          <div key={divisionKey} className="division-group">
            <div className="division-header">
              <h4>{divisionKey}</h4>
              <button 
                onClick={() => {
                  const newDivisions = { ...divisions }
                  delete newDivisions[divisionKey]
                  handleFieldChange('divisions', newDivisions)
                }}
                className="remove-button"
              >
                Remove Division
              </button>
            </div>
            
            <div className="division-fields-column">
              <div className="field-group">
                <label>Division Name</label>
                <input
                  type="text"
                  value={divisions[divisionKey].divisionName || ''}
                  onChange={(e) => handleObjectFieldChange('divisions', divisionKey, {
                    ...divisions[divisionKey],
                    divisionName: e.target.value
                  })}
                />
              </div>
              
              <div className="field-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={divisions[divisionKey].displayName || ''}
                  onChange={(e) => handleObjectFieldChange('divisions', divisionKey, {
                    ...divisions[divisionKey],
                    displayName: e.target.value
                  })}
                />
              </div>
              
              <div className="field-group">
                <label>Max Drivers Scoring Points for Team</label>
                <input
                  type="number"
                  value={divisions[divisionKey].maxDriversScoringPointsForTeam || 1}
                  onChange={(e) => handleObjectFieldChange('divisions', divisionKey, {
                    ...divisions[divisionKey],
                    maxDriversScoringPointsForTeam: parseInt(e.target.value) || 1
                  })}
                />
              </div>
              
              <div className="field-group">
                <label>Disable Same Car Validation</label>
                <input
                  type="checkbox"
                  checked={!!divisions[divisionKey].disableSameCarValidation}
                  onChange={(e) => handleObjectFieldChange('divisions', divisionKey, {
                    ...divisions[divisionKey],
                    disableSameCarValidation: e.target.checked
                  })}
                />
              </div>
              
              <div className="field-group">
                <label>Enable Same Car Class Validation</label>
                <input
                  type="checkbox"
                  checked={!!divisions[divisionKey].enableSameCarClassValidation}
                  onChange={(e) => handleObjectFieldChange('divisions', divisionKey, {
                    ...divisions[divisionKey],
                    enableSameCarClassValidation: e.target.checked
                  })}
                />
              </div>
              
              {/* WRC Configuration */}
              <div className="field-group">
                <label>WRC Championships</label>
                <div className="array-field">
                  {(divisions[divisionKey].wrc || []).map((wrc, index) => (
                    <div key={index} className="array-item">
                      <div className="field-group">
                        <label>Club ID</label>
                        <input
                          type="text"
                          value={wrc.clubId || ''}
                          onChange={(e) => {
                            const newWrc = [...(divisions[divisionKey].wrc || [])]
                            newWrc[index] = { ...wrc, clubId: e.target.value }
                            handleObjectFieldChange('divisions', divisionKey, {
                              ...divisions[divisionKey],
                              wrc: newWrc
                            })
                          }}
                        />
                      </div>
                      <div className="field-group">
                        <label>Championship IDs (comma-separated)</label>
                        <input
                          type="text"
                          value={(wrc.championshipIds || []).join(', ')}
                          onChange={(e) => {
                            const championshipIds = e.target.value.split(',').map(id => id.trim()).filter(id => id)
                            const newWrc = [...(divisions[divisionKey].wrc || [])]
                            newWrc[index] = { ...wrc, championshipIds }
                            handleObjectFieldChange('divisions', divisionKey, {
                              ...divisions[divisionKey],
                              wrc: newWrc
                            })
                          }}
                        />
                      </div>
                      <div className="field-group">
                        <label>Include Next Championships</label>
                        <input
                          type="checkbox"
                          checked={!!wrc.includeNextChampionships}
                          onChange={(e) => {
                            const newWrc = [...(divisions[divisionKey].wrc || [])]
                            newWrc[index] = { ...wrc, includeNextChampionships: e.target.checked }
                            handleObjectFieldChange('divisions', divisionKey, {
                              ...divisions[divisionKey],
                              wrc: newWrc
                            })
                          }}
                        />
                      </div>
                      <button 
                        onClick={() => {
                          const newWrc = (divisions[divisionKey].wrc || []).filter((_, i) => i !== index)
                          handleObjectFieldChange('divisions', divisionKey, {
                            ...divisions[divisionKey],
                            wrc: newWrc
                          })
                        }}
                        className="remove-button"
                      >
                        Remove WRC
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newWrc = [...(divisions[divisionKey].wrc || []), {
                        clubId: '',
                        championshipIds: [],
                        includeNextChampionships: false
                      }]
                      handleObjectFieldChange('divisions', divisionKey, {
                        ...divisions[divisionKey],
                        wrc: newWrc
                      })
                    }}
                    className="add-button"
                  >
                    Add WRC Championship
                  </button>
                </div>
              </div>
              
              {/* Points Configuration */}
              <div className="field-group">
                <label>Points Configuration</label>
                <div className="points-config">
                  <div className="field-group">
                    <label>Overall Points (comma-separated)</label>
                    <input
                      type="text"
                      value={(divisions[divisionKey].points?.overall || []).join(', ')}
                      onChange={(e) => {
                        const overall = e.target.value.split(',').map(p => parseInt(p.trim()) || 0).filter(p => !isNaN(p))
                        handleObjectFieldChange('divisions', divisionKey, {
                          ...divisions[divisionKey],
                          points: {
                            ...divisions[divisionKey].points,
                            overall
                          }
                        })
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <label>Power Stage Points (comma-separated)</label>
                    <input
                      type="text"
                      value={(divisions[divisionKey].points?.powerStage || []).join(', ')}
                      onChange={(e) => {
                        const powerStage = e.target.value.split(',').map(p => parseInt(p.trim()) || 0).filter(p => !isNaN(p))
                        handleObjectFieldChange('divisions', divisionKey, {
                          ...divisions[divisionKey],
                          points: {
                            ...divisions[divisionKey].points,
                            powerStage
                          }
                        })
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <label>Stage Points (comma-separated)</label>
                    <input
                      type="text"
                      value={(divisions[divisionKey].points?.stage || []).join(', ')}
                      onChange={(e) => {
                        const stage = e.target.value.split(',').map(p => parseInt(p.trim()) || 0).filter(p => !isNaN(p))
                        handleObjectFieldChange('divisions', divisionKey, {
                          ...divisions[divisionKey],
                          points: {
                            ...divisions[divisionKey].points,
                            stage
                          }
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Cars Configuration */}
              <div className="field-group">
                <label>Allowed Cars (one per line)</label>
                <textarea
                  value={(divisions[divisionKey].cars || []).join('\n')}
                  onChange={(e) => {
                    const cars = e.target.value.split('\n').map(car => car.trim()).filter(car => car)
                    handleObjectFieldChange('divisions', divisionKey, {
                      ...divisions[divisionKey],
                      cars
                    })
                  }}
                  rows={4}
                />
              </div>
              
              {/* Excluded Cars Configuration */}
              <div className="field-group">
                <label>Excluded Cars (one per line)</label>
                <textarea
                  value={(divisions[divisionKey].excludedCars || []).join('\n')}
                  onChange={(e) => {
                    const excludedCars = e.target.value.split('\n').map(car => car.trim()).filter(car => car)
                    handleObjectFieldChange('divisions', divisionKey, {
                      ...divisions[divisionKey],
                      excludedCars
                    })
                  }}
                  rows={4}
                />
              </div>
              
              {/* Promotion/Relegation Configuration */}
              <div className="field-group">
                <label>Promotion/Relegation</label>
                <div className="promotion-relegation-config">
                  <div className="field-group">
                    <label>Promotion Zone</label>
                    <input
                      type="number"
                      value={divisions[divisionKey].promotionRelegation?.promotionZone || ''}
                      onChange={(e) => {
                        const promotionRelegation = {
                          ...divisions[divisionKey].promotionRelegation,
                          promotionZone: parseInt(e.target.value) || undefined
                        }
                        handleObjectFieldChange('divisions', divisionKey, {
                          ...divisions[divisionKey],
                          promotionRelegation
                        })
                      }}
                    />
                  </div>
                  <div className="field-group">
                    <label>Relegation Zone</label>
                    <input
                      type="number"
                      value={divisions[divisionKey].promotionRelegation?.relegationZone || ''}
                      onChange={(e) => {
                        const promotionRelegation = {
                          ...divisions[divisionKey].promotionRelegation,
                          relegationZone: parseInt(e.target.value) || undefined
                        }
                        handleObjectFieldChange('divisions', divisionKey, {
                          ...divisions[divisionKey],
                          promotionRelegation
                        })
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button 
          onClick={() => {
            const newKey = `division${Object.keys(divisions).length + 1}`
            handleFieldChange('divisions', {
              ...divisions,
              [newKey]: {
                divisionName: newKey,
                displayName: newKey,
                maxDriversScoringPointsForTeam: 2,
                wrc: [],
                events: [],
                points: { overall: [] },
                manualResults: []
              }
            })
          }}
          className="add-button"
        >
          Add Division
        </button>
      </div>
    )
  }

  const renderHistoricalLinks = () => {
    const links = config.historicalSeasonLinks || []
    
    return (
      <div className="historical-links-section">
        <h3>Historical Season Links</h3>
        {links.map((link, index) => (
          <div key={index} className="link-group">
            <div className="field-group">
              <label>Name</label>
              <input
                type="text"
                value={link.name || ''}
                onChange={(e) => handleArrayFieldChange('historicalSeasonLinks', index, {
                  ...link,
                  name: e.target.value
                })}
              />
            </div>
            <div className="field-group">
              <label>Href</label>
              <input
                type="text"
                value={link.href || ''}
                onChange={(e) => handleArrayFieldChange('historicalSeasonLinks', index, {
                  ...link,
                  href: e.target.value
                })}
              />
            </div>
            <button 
              onClick={() => handleRemoveArrayItem('historicalSeasonLinks', index)}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ))}
        <button 
          onClick={() => handleAddArrayItem('historicalSeasonLinks', { name: '', href: '' })}
          className="add-button"
        >
          Add Link
        </button>
      </div>
    )
  }

  const handleSave = () => {
    // Basic validation
    const newErrors = []
    
    if (!config.websiteName) {
      newErrors.push('Website name is required')
    }
    
    if (config.divisions && Object.keys(config.divisions).length === 0) {
      newErrors.push('At least one division is required')
    }
    
    setErrors(newErrors)
    
    if (newErrors.length === 0) {
      onSave(config)
    }
  }

  return (
    <div className="initial-state-editor">
      <div className="editor-header">
        <h2>Initial State Configuration Editor</h2>
        <div className="editor-actions">
          <button onClick={onCancel} className="cancel-button">Cancel</button>
          <button onClick={handleSave} className="save-button">Save</button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="error-messages">
          <h4>Validation Errors:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="editor-tabs">
        <button 
          className={activeTab === 'general' ? 'active' : ''}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={activeTab === 'divisions' ? 'active' : ''}
          onClick={() => setActiveTab('divisions')}
        >
          Divisions
        </button>
        <button 
          className={activeTab === 'historical' ? 'active' : ''}
          onClick={() => setActiveTab('historical')}
        >
          Historical Links
        </button>
      </div>

      <div className="editor-content">
        {activeTab === 'general' && (
          <div className="general-section">
            <div className="general-fields">
              {generalFields.map(renderField)}
            </div>
          </div>
        )}

        {activeTab === 'divisions' && renderDivisions()}

        {activeTab === 'historical' && renderHistoricalLinks()}
      </div>
    </div>
  )
}

// InitialStateEditor component is now ready to be used
