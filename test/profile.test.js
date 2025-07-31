const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = require('../app');
const User = require('../models/userModel');

let mongoServer;
let authToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Profile API', () => {
  const userData = {
    fName: 'Akash',
    lName: 'Chaudhary',
    email: 'akchaudhary@gmail.com',
    phoneNo: '9800000000',
    password: 'chaudhary$1',
  };

  beforeEach(async () => {
    const user = new User(userData);
    await user.save();
    userId = user._id;

    // 🔧 FIX: Use `userId` in token payload to match the middleware
    authToken = jwt.sign(
      { userId: user._id }, // must match middleware's decoded.userId
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1d' }
    );
  });

  it('should fetch the user profile when authenticated', async () => {
    const res = await request(app)
      .get('/api/profile/fetch')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(userData.email);
  });

  it('should not fetch profile without token', async () => {
    const res = await request(app).get('/api/profile/fetch');
    expect(res.statusCode).toBe(401);
  });

  it('should update user profile (without image)', async () => {
    const res = await request(app)
      .put(`/api/profile/update/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .field('fName', 'UpdatedAkash');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fName).toBe('UpdatedAkash');
  });

  it('should update user profile with profile image', async () => {
    // Ensure dummy file exists
    const testImagePath = path.resolve(__dirname, 'test-files/profile.jpg');
    if (!fs.existsSync(testImagePath)) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
      fs.writeFileSync(testImagePath, 'dummy image content');
    }

    const res = await request(app)
      .put(`/api/profile/update/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .field('fName', 'AkashWithImage')
      .attach('profileImage', testImagePath);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fName).toBe('AkashWithImage');
    expect(res.body.data.profileImage).toBeDefined();
  });
});
