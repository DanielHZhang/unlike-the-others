if (!process.env.NODE_ENV) {
  console.error('NODE_ENV was not specified.');
  process.exit(1);
}

const path = require('path');

// Configure tsconfig-paths for non-relative path names
require('tsconfig-paths').register({
  baseUrl: '.',
  paths: {
    'src/*': ['src/*'],
  },
});

// Configure ts-node for server transpilation
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
  },
  transpileOnly: true,
});

// Load environment variables from .env file
require('dotenv').config({path: path.join(process.cwd(), '.local', '.env')});

// Run sever entry point
require('./server').main().catch(console.error);
