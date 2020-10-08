import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import dotenv from 'dotenv';
import path from 'path';

(async () => {
  // Load environment variables from .env files
  dotenv.config({path: path.join(process.cwd(), '.local', '.env')});
  dotenv.config({path: path.join(process.cwd(), 'prisma', '.env')});

  if (!process.env.NODE_ENV) {
    console.error('NODE_ENV was not specified.');
    process.exit(1);
  }

  // Extend dayjs functionality
  dayjs.extend(relativeTime);
  dayjs.extend(duration);

  // Run anything that is required before the server is started here
  const {main} = await import('src/server/server');
  main(process.argv);
})();
