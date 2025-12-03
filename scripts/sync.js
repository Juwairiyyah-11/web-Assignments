import 'dotenv/config';
import { sequelize } from '../src/db/index.js';
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('PostgreSQL synced.');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();