import chalk from 'chalk';

export function log(type: 'info' | 'error' | 'success', msg: string, ...other: any[]) {
  switch (type) {
    case 'info': {
      return console.log(chalk.yellowBright('[info]'), msg, ...other);
    }
    case 'error': {
      return console.error(chalk.redBright('[✕] Error:'), msg, ...other);
    }
    case 'success': {
      return console.log(chalk.greenBright('[✓]'), msg, ...other);
    }
    default: {
      return;
    }
  }
}
