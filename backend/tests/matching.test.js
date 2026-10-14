import { describe, it, expect } from 'vitest';
import {
  calculateProjectCompatibility,
  calculateStudentCompatibility,
} from '../src/services/matchingService.js';

describe('Skill-Based Matching Engine Suite', () => {
  it('calculates high compatibility for students with direct required skills', () => {
    const student = {
      skills: ['react', 'node.js', 'typescript', 'tailwind'],
      interests: ['web apps', 'developer tools'],
      preferredRoles: ['Frontend Developer', 'Full Stack Engineer'],
      availability: { status: 'actively-looking', hoursPerWeek: 20 },
      reputationScore: 120,
    };

    const project = {
      title: 'Real-time Canvas Collaboration',
      category: 'Web App',
      requiredSkills: ['react', 'typescript', 'tailwind'],
      openPositions: [{ role: 'Frontend Developer', count: 1 }],
      tags: ['web apps'],
    };

    const result = calculateProjectCompatibility(student, project);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.reasons.some((r) => r.includes('Matches'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('Direct fit for open role'))).toBe(true);
  });

  it('calculates lower score when skills and interests do not overlap', () => {
    const student = {
      skills: ['solidity', 'smart contracts'],
      interests: ['web3'],
      preferredRoles: ['Blockchain Architect'],
      availability: { status: 'busy', hoursPerWeek: 5 },
      reputationScore: 100,
    };

    const project = {
      title: 'Bio-Medical Sensor Driver',
      category: 'IoT / Hardware',
      requiredSkills: ['c++', 'embedded c', 'hardware'],
      openPositions: [{ role: 'Firmware Engineer', count: 1 }],
      tags: ['biology'],
    };

    const result = calculateProjectCompatibility(student, project);

    expect(result.score).toBeLessThan(40);
  });

  it('calculates complementary synergy between frontend and backend students', () => {
    const studentA = {
      college: 'MIT',
      skills: ['react', 'figma', 'tailwind', 'ui/ux'],
      interests: ['web apps', 'creative coding'],
      availability: { status: 'actively-looking' },
    };

    const studentB = {
      college: 'MIT',
      skills: ['node.js', 'express', 'mongodb', 'docker'],
      interests: ['web apps', 'databases'],
      availability: { status: 'actively-looking' },
    };

    const result = calculateStudentCompatibility(studentA, studentB);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.reasons.some((r) => r.includes('Complementary skill set'))).toBe(true);
    expect(result.reasons.some((r) => r.includes('Same campus'))).toBe(true);
  });
});
