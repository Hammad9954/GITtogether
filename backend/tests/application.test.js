import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Team } from '../src/models/Team.js';
import './setup.js';

describe('Applications & Team Membership Suite', () => {
  const registerUser = async (email, name) => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name,
      email,
      password: 'Password123!',
      college: 'Tech University',
    });
    return { token: res.body.data.token, user: res.body.data.user };
  };

  it('should allow student to apply to a project and prevent duplicates', async () => {
    const owner = await registerUser('owner@mit.edu', 'Project Owner');
    const applicant = await registerUser('applicant@stanford.edu', 'Applicant Student');

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Open Source Compiler',
        description: 'Building an LLVM frontend in Rust for a toy programming language.',
        category: 'Open Source',
        requiredSkills: ['rust', 'llvm', 'c++'],
      });

    const projectId = projectRes.body.data.project._id;

    // Apply
    const appRes = await request(app)
      .post(`/api/v1/applications/project/${projectId}`)
      .set('Authorization', `Bearer ${applicant.token}`)
      .send({
        role: 'Parser Developer',
        pitch: 'I have built multiple tree-sitter grammars and love Rust!',
        skills: ['rust'],
      });

    expect(appRes.status).toBe(201);
    expect(appRes.body.data.application.status).toBe('pending');

    // Duplicate application check
    const dupRes = await request(app)
      .post(`/api/v1/applications/project/${projectId}`)
      .set('Authorization', `Bearer ${applicant.token}`)
      .send({
        role: 'Parser Developer',
        pitch: 'Duplicate pitch',
      });

    expect(dupRes.status).toBe(400);
  });

  it('should prevent project owners from applying to their own projects', async () => {
    const owner = await registerUser('selfowner@mit.edu', 'Self Owner');

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'My Project',
        description: 'Trying to apply to my own project.',
        category: 'Web App',
      });

    const projectId = projectRes.body.data.project._id;

    const appRes = await request(app)
      .post(`/api/v1/applications/project/${projectId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        role: 'Founder',
        pitch: 'I am the owner',
      });

    expect(appRes.status).toBe(400);
  });

  it('accepting application automatically adds applicant to team workspace', async () => {
    const owner = await registerUser('lead@mit.edu', 'Team Lead');
    const applicant = await registerUser('member@mit.edu', 'New Member');

    const projectRes = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: 'Robotics Fleet',
        description: 'Autonomous ground vehicle fleet management.',
        category: 'IoT / Hardware',
        openPositions: [{ role: 'Firmware Dev', count: 1 }],
      });

    const projectId = projectRes.body.data.project._id;
    const teamId = projectRes.body.data.project.team;

    const applyRes = await request(app)
      .post(`/api/v1/applications/project/${projectId}`)
      .set('Authorization', `Bearer ${applicant.token}`)
      .send({
        role: 'Firmware Dev',
        pitch: 'Experienced in C and embedded systems.',
      });

    const appId = applyRes.body.data.application._id;

    // Owner accepts application
    const reviewRes = await request(app)
      .patch(`/api/v1/applications/${appId}/review`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        status: 'accepted',
        feedback: 'Welcome aboard!',
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.application.status).toBe('accepted');

    // Verify member exists in team workspace
    const team = await Team.findById(teamId);
    const memberFound = team.members.some(
      (m) => m.user.toString() === applicant.user._id.toString()
    );
    expect(memberFound).toBe(true);
  });
});
