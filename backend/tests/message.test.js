const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/User');
const Message = require('../../src/models/Message');
const bcrypt = require('bcryptjs');

describe('Message API', () => {
  let adminToken;
  let messageId;

  beforeAll(async () => {
    await User.sync({ force: true });
    await Message.sync({ force: true });
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      status: 'active'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });
    adminToken = loginResponse.body.data.token;
  });

  afterAll(async () => {
    await Message.drop();
    await User.drop();
  });

  describe('POST /api/messages', () => {
    it('should create a new message with admin token', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Message',
          content: 'This is a test message content',
          type: 'important',
          groupId: 'all',
          attachments: []
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Message');
      messageId = response.body.data.id;
    });

    it('should fail without admin token', async () => {
      const response = await request(app)
        .post('/api/messages')
        .send({
          title: 'Unauthorized Message',
          content: 'This should fail',
          type: 'daily',
          groupId: 'all'
        });

      expect(response.status).toBe(401);
    });

    it('should fail with missing title', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Message without title',
          type: 'daily',
          groupId: 'all'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with invalid type', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Invalid Type Message',
          content: 'This should fail',
          type: 'invalid_type',
          groupId: 'all'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/messages', () => {
    it('should get all messages', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/messages');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/:id', () => {
    it('should get message by id', async () => {
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(messageId);
    });

    it('should fail with invalid message id', async () => {
      const response = await request(app)
        .get('/api/messages/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/messages/:id', () => {
    it('should update message with admin token', async () => {
      const response = await request(app)
        .put(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Message',
          content: 'Updated content',
          type: 'system'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Message');
    });

    it('should fail with invalid message id', async () => {
      const response = await request(app)
        .put('/api/messages/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Message'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete message with admin token', async () => {
      const response = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail with invalid message id', async () => {
      const response = await request(app)
        .delete('/api/messages/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
