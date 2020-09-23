import webpack from 'webpack';
import {register} from 'tsconfig-paths';

/**
 * Manually rebuild the webpack DLL files.
 */
async function main() {
  const {
    compilerOptions: {baseUrl, paths},
  } = await import('../tsconfig.json');
  register({baseUrl, paths});
  const {config} = await import('../src/webpack/dll');
  webpack(config).run((error, stats) => {
    if (error) {
      console.error(error);
    } else {
      console.log(stats);
    }
  });
}

main().catch(console.error);
