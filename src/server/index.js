if (!process.env.NODE_ENV) {
  console.error('NODE_ENV was not specified.');
  process.exit(1);
}

const path = require('path');
const tsConfigPaths = require('tsconfig-paths');
const tsNode = require('ts-node');
const dotenv = require('dotenv');
const {
  compilerOptions: {baseUrl, paths},
} = require('../../tsconfig.json');

// Configure tsconfig-paths for non-relative path names
tsConfigPaths.register({baseUrl, paths});

// Configure ts-node for server transpilation
tsNode.register({transpileOnly: true});

// Load environment variables from .env files
dotenv.config({path: path.join(process.cwd(), '.local', '.env')});
dotenv.config({path: path.join(process.cwd(), 'prisma', '.env')});

// Run sever entry point
require('./server');
