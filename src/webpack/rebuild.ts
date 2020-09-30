import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import type {Logger} from 'pino';
import {BUILD_FOLDER_PATH, vendors} from 'src/webpack/constants';
import {LOCAL_FOLDER_PATH} from 'src/server/config/constants';

function compile(config: webpack.Configuration) {
  return new Promise<webpack.Stats>((resolve, reject) => {
    webpack(config).run((error, stats) => (error ? reject(error) : resolve(stats)));
  });
}

function isFlatObjectEqual(a: Record<string, string>, b: Record<string, string>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (
    aKeys.length !== bKeys.length ||
    aKeys.some((key) => !b[key] || a[key] !== b[key]) ||
    aKeys.some((key) => !b[key] || a[key] !== b[key])
  ) {
    return false;
  }
  return true;
}

function isFlatArrayEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) {
    return false;
  }
  a.sort();
  b.sort();
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export async function buildWebpackDll(logger: Logger) {
  const packageJson = await import('package.json');
  const {config} = await import('src/webpack/dll');

  // Ensure .local folder exists
  try {
    await fs.promises.access(LOCAL_FOLDER_PATH);
  } catch (error) {
    await fs.promises.mkdir(LOCAL_FOLDER_PATH);
  }

  // Ensure .local dependency file exists
  const localDepsFile = path.join(LOCAL_FOLDER_PATH, 'dependencies.json');
  try {
    await Promise.all([fs.promises.access(localDepsFile), fs.promises.access(BUILD_FOLDER_PATH)]);
    const localJson = await import('../../.local/dependencies.json');
    if (
      localJson.dependencies &&
      localJson.devDependencies &&
      localJson.vendors &&
      isFlatObjectEqual(localJson.dependencies, packageJson.dependencies) &&
      isFlatObjectEqual(localJson.devDependencies, packageJson.devDependencies) &&
      isFlatArrayEqual(localJson.vendors, vendors)
    ) {
      logger.info('DLL up-to-date, skipping rebuild.');
    } else {
      throw new Error('Rebuild required.');
    }
  } catch (error) {
    // If dependencies or versions have changed, recompile dll and write new dependencies
    logger.info('Building webpack DLL bundle...');
    const newDependencies = {
      vendors,
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies,
    };
    const stringified = JSON.stringify(newDependencies, null, 2);
    await fs.promises.writeFile(localDepsFile, stringified, {flag: 'w'});
    await compile(config);
    logger.info(`Webpack DLL built and emitted to ${config.output!.path}`);
  }
}
