import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Team } from '../src/models/Team.js';
import './setup.js';

describe('Team Management Suite', () => {
  const registerUser = async (email, name) => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name,
      email,
      password: 'Password123!',
      college: 'Harvard University',
    });
    return { token: res.body.data.token, user: res.body.data.user };
  };

  it('allows team leaders to invite members and members to accept', async () => {
    const leader = await registerUser('lead@harvard.edu', 'Leader One');
    const invitee = await registerUser('invitee@harvard.edu', 'Invitee One');

    // Create team
    const teamRes = await request(app)
      .post('/api/v1/teams')
      .set('Authorization', `Bearer ${leader.token}`)
      .send({
        name: 'Quantum Hackers',
        description: 'Building quantum circuit simulators.',
        maxMembers: 4,
      });

    const teamId = teamRes.body.data.team._id;

    // Send invitation
    const inviteRes = await request(app)
      .post(`/api/v1/teams/${teamId}/invite`)
      .set('Authorization', `Bearer ${leader.token}`)
      .send({
        inviteeId: invitee.user._id,
        role: 'Quantum Algorithmist',
        message: 'Join our team for the upcoming hackathon!',
      });

    expect(inviteRes.status).toBe(201);
    const invitationId = inviteRes.body.data.invitation._id;

    // Invitee views invitations
    const listRes = await request(app)
      .get('/api/v1/teams/invitations')
      .set('Authorization', `Bearer ${invitee.token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.invitations.length).toBe(1);

    // Invitee accepts
    const acceptRes = await request(app)
      .post(`/api/v1/teams/invitations/${invitationId}/respond`)
      .set('Authorization', `Bearer ${invitee.token}`)
      .send({ response: 'accepted' });

    expect(acceptRes.status).toBe(200);

    // Verify membership in team
    const updatedTeam = await Team.findById(teamId);
    expect(updatedTeam.members.length).toBe(2);
  });
});
