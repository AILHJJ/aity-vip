const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

describe('User API', () => {
  let adminToken;
  let testUserId;

  beforeAll(async () => {
    await User.sync({ force: true });
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
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
    await User.drop();
  });

  describe('POST /api/users', () => {
    it('should create a new user with admin token', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'vip_mid',
          status: 'active'
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('New User');
      testUserId = response.body.data.id;
    });

    it('should fail without admin token', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Unauthorized User',
          email: 'unauthorized@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Email User',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Short Password User',
          email: 'short@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should fail with invalid role', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Role User',
          email: 'invalidrole@example.com',
          password: 'password123',
          role: 'invalid_role'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/users', () => {
    it('should get all users with admin token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without admin token', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(testUserId);
    });

    it('should fail with invalid user id', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with admin token', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated User',
          status: 'inactive'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated User');
      expect(response.body.data.status).toBe('inactive');
    });

    it('should fail with invalid user id', async () => {
      const response = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated User'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with admin token', async () => {
      const response = await request(app)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail with invalid user id', async () => {
      const response = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
