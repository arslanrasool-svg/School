require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'school-connect-secret-key-change-in-production',
  jwtExpiration: '7d',
  database: {
    url: process.env.DATABASE_URL
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  notification: {
    expoAccessToken: process.env.EXPO_ACCESS_TOKEN || ''
  }
};
