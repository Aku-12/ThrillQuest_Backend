//Authentication four test cases
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/userModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Disconnect from any default connection before reconnecting
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Auth API', () => {
  const newUser = {
    fName: 'Akash',
    lName: 'Chaudhary',
    email: 'akchaudhary@gmail.com',
    phoneNo: '9800000000',
    role: 'customer',
    password: 'chaudhary$1',
  };

  it('should create a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should not allow duplicate user registration', async () => {
    await request(app).post('/api/auth/register').send(newUser);
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.statusCode).toBe(403);
  });

  it('should log in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(newUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: newUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(newUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: newUser.email, password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
  });

  it('should reject login if user not found', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'none@user.com', password: '123' });

    expect(res.statusCode).toBe(401);
  });
});
