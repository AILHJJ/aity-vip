const sequelize = require('../src/config/db');

module.exports = async () => {
  try {
    console.log('Closing test database connection...');
    await sequelize.close();
    console.log('Test database connection closed successfully');
  } catch (error) {
    console.error('Global teardown failed:', error);
    throw error;
  }
};
