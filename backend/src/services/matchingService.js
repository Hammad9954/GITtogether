/**
 * Explainable Skill-based Compatibility Matching Engine
 * Uses deterministic set overlap, category taxonomy, and availability metrics.
 */

// Complementary skill taxonomy pairs
const COMPLEMENTARY_PAIRS = [
  { groupA: ['react', 'vue', 'angular', 'frontend', 'tailwind', 'html', 'css'], groupB: ['node.js', 'express', 'django', 'fastapi', 'spring', 'backend', 'golang'] },
  { groupA: ['frontend', 'backend', 'fullstack'], groupB: ['ui/ux', 'figma', 'design', 'prototyping'] },
  { groupA: ['python', 'pytorch', 'tensorflow', 'machine learning', 'data science'], groupB: ['react', 'fastapi', 'docker', 'devops', 'frontend'] },
  { groupA: ['solidity', 'web3', 'smart contracts'], groupB: ['react', 'next.js', 'ethers.js', 'frontend'] },
  { groupA: ['mobile', 'react native', 'flutter', 'swift', 'kotlin'], groupB: ['node.js', 'firebase', 'graphql', 'backend'] },
];

/**
 * Calculate Student-to-Project Compatibility (0 - 100)
 */
export const calculateProjectCompatibility = (user, project) => {
  const reasons = [];
  let score = 0;

  const userSkills = (user.skills || []).map((s) => s.toLowerCase().trim());
  const projectSkills = (project.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const userInterests = (user.interests || []).map((i) => i.toLowerCase().trim());
  const projectTags = (project.tags || []).map((t) => t.toLowerCase().trim());

  // 1. Direct Skill Overlap (up to 45 pts)
  if (projectSkills.length > 0) {
    const matchedSkills = userSkills.filter((s) =>
      projectSkills.some((ps) => ps === s || ps.includes(s) || s.includes(ps))
    );
    const overlapRatio = matchedSkills.length / projectSkills.length;
    const skillScore = Math.min(Math.round(overlapRatio * 45), 45);
    score += skillScore;

    if (matchedSkills.length > 0) {
      reasons.push(
        `Matches ${matchedSkills.length} of ${projectSkills.length} required skill(s): ${matchedSkills.slice(0, 3).join(', ')}`
      );
    }
  } else {
    // If no specific skills required, open project
    score += 30;
    reasons.push('Open project with flexible skill requirements');
  }

  // 2. Open Position & Preferred Role Match (up to 20 pts)
  const openPositions = project.openPositions || [];
  const preferredRoles = (user.preferredRoles || []).map((r) => r.toLowerCase().trim());

  let positionMatched = null;
  for (const pos of openPositions) {
    const posRole = pos.role.toLowerCase().trim();
    if (preferredRoles.some((pr) => pr.includes(posRole) || posRole.includes(pr))) {
      positionMatched = pos.role;
      break;
    }
  }

  if (positionMatched) {
    score += 20;
    reasons.push(`Direct fit for open role: "${positionMatched}"`);
  } else if (openPositions.length > 0) {
    score += 8;
  }

  // 3. Category & Interests Synergy (up to 15 pts)
  const categoryLower = (project.category || '').toLowerCase();
  const matchedInterests = userInterests.filter(
    (interest) =>
      categoryLower.includes(interest) ||
      interest.includes(categoryLower) ||
      projectTags.some((tag) => tag.includes(interest) || interest.includes(tag))
  );

  if (matchedInterests.length > 0) {
    score += 15;
    reasons.push(`Shares interest in ${matchedInterests.slice(0, 2).join(', ')}`);
  } else if (project.category) {
    score += 5;
  }

  // 4. Availability & Working Hours (up to 15 pts)
  const availStatus = user.availability?.status || 'actively-looking';
  const hours = user.availability?.hoursPerWeek || 10;

  if (availStatus === 'actively-looking') {
    score += 15;
    reasons.push(`Actively looking for projects (${hours} hrs/week)`);
  } else if (availStatus === 'open-to-offers') {
    score += 10;
    reasons.push(`Open to project offers (${hours} hrs/week)`);
  } else if (availStatus === 'busy') {
    score += 4;
  }

  // 5. Reputation & Profile Quality Bonus (up to 5 pts)
  if (user.reputationScore >= 110) {
    score += 5;
    reasons.push(`Strong peer reputation score (${user.reputationScore})`);
  }

  const finalScore = Math.min(Math.max(score, 5), 100);

  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ['General skill and domain overlap'],
  };
};

/**
 * Calculate Student-to-Student Teammate Compatibility (0 - 100)
 */
export const calculateStudentCompatibility = (userA, userB) => {
  const reasons = [];
  let score = 0;

  const skillsA = (userA.skills || []).map((s) => s.toLowerCase().trim());
  const skillsB = (userB.skills || []).map((s) => s.toLowerCase().trim());
  const interestsA = (userA.interests || []).map((i) => i.toLowerCase().trim());
  const interestsB = (userB.interests || []).map((i) => i.toLowerCase().trim());

  // 1. Complementary Skill Matrix (up to 35 pts)
  let foundComplementary = false;
  for (const pair of COMPLEMENTARY_PAIRS) {
    const aInGroupA = skillsA.some((s) => pair.groupA.includes(s));
    const bInGroupB = skillsB.some((s) => pair.groupB.includes(s));
    const bInGroupA = skillsB.some((s) => pair.groupA.includes(s));
    const aInGroupB = skillsA.some((s) => pair.groupB.includes(s));

    if ((aInGroupA && bInGroupB) || (bInGroupA && aInGroupB)) {
      foundComplementary = true;
      break;
    }
  }

  if (foundComplementary) {
    score += 35;
    reasons.push('Complementary skill set (e.g. Frontend + Backend / Design + Engineering)');
  } else {
    score += 15;
  }

  // 2. Shared Common Foundation & Language (up to 25 pts)
  const sharedSkills = skillsA.filter((s) => skillsB.includes(s));
  if (sharedSkills.length > 0) {
    const sharedPts = Math.min(sharedSkills.length * 8, 25);
    score += sharedPts;
    reasons.push(`Common tech stack: ${sharedSkills.slice(0, 3).join(', ')}`);
  }

  // 3. Shared Interests / Hackathon Themes (up to 20 pts)
  const sharedInterests = interestsA.filter((i) => interestsB.includes(i));
  if (sharedInterests.length > 0) {
    score += 20;
    reasons.push(`Shared interests in ${sharedInterests.slice(0, 2).join(', ')}`);
  }

  // 4. Availability Alignment (up to 10 pts)
  const aStatus = userA.availability?.status;
  const bStatus = userB.availability?.status;
  if (aStatus === 'actively-looking' && bStatus === 'actively-looking') {
    score += 10;
    reasons.push('Both students are actively seeking project teammates');
  } else if (aStatus !== 'unavailable' && bStatus !== 'unavailable') {
    score += 6;
  }

  // 5. College / Campus Proximity (up to 10 pts)
  if (userA.college && userB.college && userA.college.toLowerCase() === userB.college.toLowerCase()) {
    score += 10;
    reasons.push(`Same campus: ${userA.college}`);
  }

  const finalScore = Math.min(Math.max(score, 10), 100);

  return {
    score: finalScore,
    reasons: reasons.length > 0 ? reasons : ['Compatible collaboration profile'],
  };
};
