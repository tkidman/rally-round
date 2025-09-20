const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

// Load the schema
const schemaPath = path.join(__dirname, "initialStateSchema.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

// Create AJV instance with formats
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Compile the schema
const validate = ajv.compile(schema);

/**
 * Validates an initialState configuration object
 * @param {Object} config - The configuration object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
const validateInitialState = config => {
  const isValid = validate(config);

  return {
    isValid,
    errors: isValid ? [] : validate.errors || []
  };
};

/**
 * Validates an initialState.js file
 * @param {string} filePath - Path to the initialState.js file
 * @returns {Object} - Validation result with isValid, errors, and config
 */
const validateInitialStateFile = filePath => {
  try {
    // Read and evaluate the JavaScript file
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Create a safe evaluation context
    const context = {
      module: { exports: {} },
      require: id => {
        // Mock require for dependencies
        if (id.includes("shared")) {
          return { privateer: "privateer" };
        }
        return {};
      }
    };

    // Evaluate the file in the context
    const func = new Function("module", "require", fileContent);
    func(context.module, context.require);

    const config = context.module.exports;

    const validation = validateInitialState(config);

    return {
      ...validation,
      config,
      filePath
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          message: `Error parsing file: ${error.message}`,
          dataPath: "",
          schemaPath: ""
        }
      ],
      config: null,
      filePath
    };
  }
};

/**
 * Validates all initialState.js files in the state directory
 * @returns {Array} - Array of validation results for each file
 */
const validateAllInitialStateFiles = () => {
  const stateDir = path.join(__dirname, "..");
  const results = [];

  // Get all subdirectories
  const subdirs = fs
    .readdirSync(stateDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const subdir of subdirs) {
    const initialStatePath = path.join(stateDir, subdir, "initialState.js");

    if (fs.existsSync(initialStatePath)) {
      const result = validateInitialStateFile(initialStatePath);
      results.push(result);
    }
  }

  return results;
};

/**
 * Formats validation errors for display
 * @param {Array} errors - Array of validation errors
 * @returns {string} - Formatted error message
 */
const formatValidationErrors = errors => {
  if (!errors || errors.length === 0) {
    return "No errors found";
  }

  return errors
    .map(error => {
      const path = error.dataPath || error.instancePath || "root";
      const message = error.message || "Unknown error";
      return `  ${path}: ${message}`;
    })
    .join("\n");
};

module.exports = {
  validateInitialState,
  validateInitialStateFile,
  validateAllInitialStateFiles,
  formatValidationErrors
};
