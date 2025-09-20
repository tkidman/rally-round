# Initial State Configuration Editor

A web-based editor for managing `initialState.js` configuration files with JSON Schema validation.

## Features

- 🎨 **Visual Editor**: User-friendly interface for editing configuration files
- ✅ **Schema Validation**: JSON Schema validation to ensure configuration integrity
- 📁 **Multi-Config Support**: Manage multiple configuration instances
- 💾 **Auto-Save**: Save changes directly to the file system
- 📥 **Import/Export**: Download configurations as JavaScript files
- 🔍 **Validation**: Real-time validation with detailed error messages

## Quick Start

### 1. Install Dependencies

```bash
cd src/state/editor
npm install
```

### 2. Start the Editor

```bash
npm start
```

The editor will be available at `http://localhost:3001`

### 3. Validate Existing Configurations

```bash
npm run validate
```

## Usage

### Web Interface

1. Open `http://localhost:3001` in your browser
2. Select a configuration to edit
3. Make changes using the form fields
4. Click "Save" to save changes
5. Use "Download" to export the configuration

### API Endpoints

- `GET /api/state/configs` - List all available configurations
- `GET /api/state/:configName/initialState` - Get a specific configuration
- `POST /api/state/:configName/initialState` - Save a configuration
- `POST /api/state/validate` - Validate a configuration object

### Command Line Validation

```bash
# Validate all configurations
node validate.js

# Validate a specific file
node -e "
const { validateInitialStateFile } = require('./validator');
const result = validateInitialStateFile('./path/to/initialState.js');
console.log(result.isValid ? 'Valid' : 'Invalid');
console.log(result.errors);
"
```

## Configuration Schema

The editor uses a comprehensive JSON Schema that defines:

- **General Settings**: Website name, display options, scoring rules
- **Divisions**: Multiple division configurations with WRC/RBR settings
- **Points Systems**: Configurable point structures for different positions
- **Historical Links**: Links to previous seasons
- **Team Overrides**: Custom team assignments
- **Filtering**: Entry filtering and validation rules

## File Structure

```
src/state/editor/
├── index.html              # Main editor interface
├── server.js               # Express server
├── api.js                  # API endpoints
├── package.json            # Dependencies
├── validate.js             # Validation script
├── README.md               # This file
└── schema/
    ├── initialStateSchema.json  # JSON Schema definition
    └── validator.js             # Validation utilities
```

## Development

### Adding New Fields

1. Update the JSON Schema in `schema/initialStateSchema.json`
2. Add the field to the `generalFields` array in `InitialStateEditor.jsx`
3. Update the validation logic if needed

### Custom Validation

Add custom validation rules in `validator.js`:

```javascript
const customValidation = (config) => {
  const errors = []
  
  // Add your custom validation logic
  if (config.someField && config.someField < 0) {
    errors.push('Some field must be positive')
  }
  
  return errors
}
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**: Change the PORT environment variable
2. **File Permission Errors**: Ensure the editor has write permissions
3. **Validation Errors**: Check the console for detailed error messages

### Debug Mode

Set `NODE_ENV=development` for additional logging:

```bash
NODE_ENV=development npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
