import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import {log} from 'src/server/utils/logs';
import {BUILD_FOLDER_PATH, vendors} from 'src/webpack/constants';

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

export async function buildWebpackDll() {
  const packageJson = await import('package.json');
  const {config} = await import('src/webpack/dll');

  // Ensure .local folder exists
  const localFolderPath = path.join(process.cwd(), '.local');
  try {
    await fs.promises.access(localFolderPath);
  } catch (error) {
    await fs.promises.mkdir(localFolderPath);
  }

  // Ensure .local dependency file exists
  const localDepsFile = path.join(localFolderPath, 'dependencies.json');
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
      log('success', 'DLL up-to-date, skipping rebuild.');
    } else {
      throw new Error('Rebuild required.');
    }
  } catch (error) {
    // If dependencies or versions have changed, recompile dll and write new dependencies
    log('info', 'Building webpack DLL bundle...');
    const newDependencies = {
      vendors,
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies,
    };
    const stringified = JSON.stringify(newDependencies, null, 2);
    await fs.promises.writeFile(localDepsFile, stringified, {flag: 'w'});
    await compile(config);
    log('success', `Webpack DLL built and emitted to ${config.output!.path}`);
  }
}
