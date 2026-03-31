const path = require('node:path');
const runSqlFile = require('./runSqlFile');

const tasks = {
  'db:init': [
    { file: '../migrations/000_create_database.sql', withoutDatabase: true },
    { file: '../migrations/001_init_schema.sql' }
  ],
  'seed:base': [
    { file: '../seeds/00_base_seed.sql' }
  ],
  'seed:all': [
    { file: '../seeds/00_base_seed.sql' },
    { file: '../seeds/01_certificate_track_seed.sql' },
    { file: '../seeds/02_instructor_led_seed.sql' },
    { file: '../seeds/03_assessment_heavy_seed.sql' }
  ]
};

async function main() {
  const mode = process.argv[2];
  if (!tasks[mode]) {
    // eslint-disable-next-line no-console
    console.error('Usage: node db/scripts/seedRunner.js <db:init|seed:base|seed:all>');
    process.exit(1);
  }

  for (const task of tasks[mode]) {
    const filePath = path.resolve(__dirname, task.file);
    // eslint-disable-next-line no-console
    console.log(`Running ${filePath}`);
    await runSqlFile(filePath, { withoutDatabase: task.withoutDatabase });
  }

  // eslint-disable-next-line no-console
  console.log('Done');
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
