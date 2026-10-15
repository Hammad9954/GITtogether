import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Authentication & Authorization Suite', () => {
  const testUser = {
    name: 'Test Student',
    email: 'student@college.edu',
    password: 'Password123!',
    college: 'State University',
    course: 'Computer Science',
    year: '2nd Year',
  };

  it('should register a new student and return a token and verification code', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should prevent registering duplicate email addresses', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with correct credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should access protected profile route with token', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  it('should reject unauthenticated requests to protected routes', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration if password does not meet strong password requirements', async () => {
    // Too short (< 8 chars)
    let res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      email: 'short@college.edu',
      password: 'Pass1!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Missing uppercase
    res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      email: 'noupper@college.edu',
      password: 'password123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Missing lowercase
    res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      email: 'nolower@college.edu',
      password: 'PASSWORD123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Missing number
    res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      email: 'nonumber@college.edu',
      password: 'Password!@#$',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Missing special character
    res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      email: 'nospecial@college.edu',
      password: 'Password1234',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
