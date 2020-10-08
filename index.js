const {
  compilerOptions: {baseUrl, paths},
} = require('./tsconfig.json');

// Configure tsconfig-paths for non-relative path names
require('tsconfig-paths').register({baseUrl, paths});

// Configure ts-node for server transpilation
require('ts-node').register({transpileOnly: true});

// Run sever entry point
require('./src/server');
