import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Security & Authorization Audit Suite', () => {
  const alice = {
    name: 'Alice Student',
    email: 'alice.sec@college.edu',
    password: 'Password123!',
    college: 'MIT',
    course: 'CS',
  };

  const bob = {
    name: 'Bob Student',
    email: 'bob.sec@college.edu',
    password: 'Password123!',
    college: 'Harvard',
    course: 'Design',
  };

  const charlie = {
    name: 'Charlie Stranger',
    email: 'charlie.sec@college.edu',
    password: 'Password123!',
    college: 'Stanford',
    course: 'Bio',
  };

  it('should prevent privilege escalation by ignoring role: admin in registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      ...alice,
      role: 'admin',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('student');
  });

  it('should prevent privilege escalation during profile update', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(bob);
    const token = regRes.body.data.token;

    const updateRes = await request(app)
      .put('/api/v1/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Bob Updated',
        role: 'admin',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.user.role).toBe('student');
  });

  it('should block non-admin students from accessing admin endpoints', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(alice);
    const token = regRes.body.data.token;

    const adminRes = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${token}`);

    expect(adminRes.status).toBe(403);
    expect(adminRes.body.success).toBe(false);
  });

  it('should prevent unauthorized students from reading or sending messages to conversations they do not belong to', async () => {
    // 1. Register Alice & Bob
    const aliceRes = await request(app).post('/api/v1/auth/register').send(alice);
    const bobRes = await request(app).post('/api/v1/auth/register').send(bob);
    const charlieRes = await request(app).post('/api/v1/auth/register').send(charlie);

    const aliceToken = aliceRes.body.data.token;
    const charlieToken = charlieRes.body.data.token;
    const bobId = bobRes.body.data.user._id;

    // 2. Alice starts a private conversation with Bob
    const convoRes = await request(app)
      .post('/api/v1/messages/conversations/private')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ recipientId: bobId });

    expect(convoRes.status).toBe(200);
    const conversationId = convoRes.body.data.conversation._id;

    // 3. Charlie (stranger) attempts to read messages in Alice & Bob's conversation
    const eavesdropRes = await request(app)
      .get(`/api/v1/messages/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${charlieToken}`);

    expect(eavesdropRes.status).toBe(403);
    expect(eavesdropRes.body.success).toBe(false);

    // 4. Charlie attempts to send a message into Alice & Bob's conversation
    const intrusionRes = await request(app)
      .post(`/api/v1/messages/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${charlieToken}`)
      .send({ content: 'I should not be here' });

    expect(intrusionRes.status).toBe(403);
    expect(intrusionRes.body.success).toBe(false);
  });

  it('should reject peer review if reviewer and reviewee never collaborated on the specified project', async () => {
    const aliceRes = await request(app).post('/api/v1/auth/register').send(alice);
    const charlieRes = await request(app).post('/api/v1/auth/register').send(charlie);

    const aliceToken = aliceRes.body.data.token;
    const charlieId = charlieRes.body.data.user._id;

    // Alice creates a project
    const projRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        title: 'Project With No Charlie',
        description: 'Only Alice is in this project team.',
        category: 'Web App',
        teamSize: 3,
        requiredSkills: ['React'],
      });

    expect(projRes.status).toBe(201);
    const projectId = projRes.body.data.project._id;

    // Alice tries to review Charlie who is not on the team
    const reviewRes = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        revieweeId: charlieId,
        projectId,
        rating: 5,
        comment: 'Great peer even though we never worked together!',
      });

    expect(reviewRes.status).toBe(403);
    expect(reviewRes.body.success).toBe(false);
  });
});
