const sequelize = require('../src/config/db');
const User = require('../src/models/User');
const Message = require('../src/models/Message');
const MessageAttachment = require('../src/models/MessageAttachment');
const UserMessageRead = require('../src/models/UserMessageRead');
const Discussion = require('../src/models/Discussion');
const DiscussionReply = require('../src/models/DiscussionReply');

module.exports = async () => {
  try {
    console.log('Connecting to test database...');
    await sequelize.authenticate();
    console.log('Test database connected successfully');

    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Sync all models with force: true to drop and recreate tables
    console.log('Initializing database tables...');
    await sequelize.sync({ force: true });

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Database tables initialized successfully');

    // Keep connection open for tests
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  }
};
