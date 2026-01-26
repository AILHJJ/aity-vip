const sequelize = require('../src/config/db');

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Test database connection failed:', error);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
  }
});
