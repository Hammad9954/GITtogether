import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

describe('Project Management Suite', () => {
  let token;
  let otherToken;

  const testProject = {
    title: 'Autonomous Drone Navigation System',
    description: 'Developing ROS2 and PyTorch SLAM navigation algorithms for quadcopters.',
    category: 'AI/ML',
    requiredSkills: ['python', 'c++', 'pytorch', 'ros2'],
    openPositions: [
      { role: 'Computer Vision Lead', count: 1, description: 'SLAM model fine-tuning' },
    ],
    teamSize: 4,
    tags: ['robotics', 'drone', 'ai'],
  };

  const registerUser = async (email, name) => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name,
      email,
      password: 'Password123!',
      college: 'Tech University',
    });
    return res.body.data.token;
  };

  it('should create a new project and automatically spin up a team workspace', async () => {
    token = await registerUser('alice@tech.edu', 'Alice Founder');

    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(testProject);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.project.title).toBe(testProject.title);
    expect(res.body.data.project.team).toBeDefined();
  });

  it('should list projects with category filters', async () => {
    token = await registerUser('alice@tech.edu', 'Alice Founder');
    await request(app).post('/api/v1/projects').set('Authorization', `Bearer ${token}`).send(testProject);

    const res = await request(app).get('/api/v1/projects?category=AI/ML');
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
    expect(res.body.data.items[0].category).toBe('AI/ML');
  });

  it('should prevent unauthorized users from editing another student’s project', async () => {
    token = await registerUser('alice@tech.edu', 'Alice Founder');
    otherToken = await registerUser('bob@other.edu', 'Bob Hacker');

    const createRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send(testProject);

    const projectId = createRes.body.data.project._id;

    // Bob tries to edit Alice's project
    const updateRes = await request(app)
      .put(`/api/v1/projects/${projectId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ title: 'Hacked Title' });

    expect(updateRes.status).toBe(403);
  });
});
