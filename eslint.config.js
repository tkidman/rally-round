const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const pluginPrettier = require('eslint-plugin-prettier');
const pluginJest = require('eslint-plugin-jest');

module.exports = [
  // Base recommended config
  js.configs.recommended,
  
  // Files to lint
  {
    files: ['**/*.js'],
    ignores: [
      'node_modules/**',
      'src/state/editor/node_modules/**',
      'hidden/**',
      '**/*.html'
    ],
    
    plugins: {
      prettier: pluginPrettier,
      jest: pluginJest
    },
    
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'writable',
        global: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        
        // Browser globals (for Puppeteer code)
        document: 'readonly',
        window: 'readonly',
        
        // Jest globals
        test: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    
    rules: {
      // Prettier
      'prettier/prettier': 'error',
      
      // Standard-style rules (equivalent to what "standard" provides)
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { 
        args: 'none',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrors: 'none'
      }],
      
      // Custom rules from original config
      'no-console': 'off',
      
      // Jest rules
      ...pluginJest.configs['flat/recommended'].rules
    }
  },
  
  // Prettier config (must be last to override other configs)
  prettier
];
