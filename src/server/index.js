if (!process.env.NODE_ENV) {
  console.error('NODE_ENV was not specified.');
  process.exit(1);
}

const path = require('path');
const tsConfig = require('../../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');
const tsNode = require('ts-node');
const dotenv = require('dotenv');

// Configure tsconfig-paths for non-relative path names
tsConfigPaths.register({
  baseUrl: tsConfig.compilerOptions.baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

// Configure ts-node for server transpilation
tsNode.register({transpileOnly: true});

// Load environment variables from .env file
dotenv.config({path: path.join(process.cwd(), '.local', '.env')});

// Run sever entry point
require('./server').main().catch(console.error);
