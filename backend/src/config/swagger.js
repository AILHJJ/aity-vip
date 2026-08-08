const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AITY VIP API',
      version: '1.0.0',
      description: '投研内部分享系统 API 文档',
      contact: {
        name: 'API Support',
        email: 'support@aity88.online'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发服务器'
      },
      {
        url: 'https://aity88.online:8443',
        description: '生产服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { 
              type: 'string', 
              enum: ['super_admin', 'admin', 'vip_mid', 'vip_short', 'trial'] 
            },
            groupId: { type: 'string' },
            avatar: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive'] }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            type: { type: 'string', enum: ['system', 'important', 'daily'] },
            sender: { type: 'string' },
            senderId: { type: 'integer' },
            groupId: { type: 'string' },
            readCount: { type: 'integer' },
            totalCount: { type: 'integer' },
            attachments: { type: 'array', items: { type: 'object' } }
          }
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' }
          }
        },
        Discussion: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            content: { type: 'string' },
            author: { type: 'string' },
            authorId: { type: 'integer' },
            groupId: { type: 'string' },
            replyCount: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'integer' },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
