import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Team } from '../models/Team.js';
import { Application } from '../models/Application.js';
import { Hackathon } from '../models/Hackathon.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { SkillSession } from '../models/SkillSession.js';
import { Review } from '../models/Review.js';
import { Notification } from '../models/Notification.js';
import { connectDB, closeDB } from '../config/db.js';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting Git Together database seed process...');
    await connectDB();

    // Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Team.deleteMany({}),
      Application.deleteMany({}),
      Hackathon.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      SkillSession.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Seed Users
    console.log('👤 Seeding users...');
    const users = await User.create([
      {
        name: 'Admin Moderator',
        email: 'admin@gittogether.edu',
        password: 'Password123!',
        role: 'admin',
        isVerified: true,
        college: 'Massachusetts Institute of Technology',
        course: 'Computer Science & Engineering',
        year: 'Faculty / Staff',
        bio: 'Git Together platform supervisor and student innovation program coordinator.',
        skills: ['management', 'python', 'security', 'mentorship'],
        interests: ['student startups', 'open source', 'ethics in tech'],
        availability: { hoursPerWeek: 40, status: 'open-to-offers' },
        reputationScore: 500,
      },
      {
        name: 'Alex Rivera',
        email: 'alex@mit.edu',
        password: 'Password123!',
        role: 'student',
        isVerified: true,
        college: 'Massachusetts Institute of Technology',
        course: 'Computer Science',
        year: '3rd Year',
        bio: 'Full-stack software engineer passionate about developer tools, distributed systems, and real-time collaboration engines.',
        skills: ['react', 'node.js', 'typescript', 'mongodb', 'docker', 'graphql', 'tailwind'],
        interests: ['web apps', 'developer tooling', 'open source', 'distributed systems'],
        preferredRoles: ['Full Stack Engineer', 'Backend Lead', 'System Architect'],
        portfolioLinks: {
          github: 'https://github.com/alexrivera-demo',
          linkedin: 'https://linkedin.com/in/alexrivera-demo',
          website: 'https://alexrivera.dev',
        },
        experience: [
          {
            title: 'Software Engineering Intern',
            organization: 'Stripe',
            duration: 'Summer 2025',
            description: 'Built high-throughput payment ingestion pipelines and internal developer dashboards.',
          },
        ],
        availability: { hoursPerWeek: 20, status: 'actively-looking' },
        reputationScore: 160,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@stanford.edu',
        password: 'Password123!',
        role: 'student',
        isVerified: true,
        college: 'Stanford University',
        course: 'Artificial Intelligence & Data Science',
        year: 'Graduate / MS',
        bio: 'ML researcher focused on LLMs, multi-agent architectures, and educational technology. Looking to build AI apps with great UX teammates.',
        skills: ['python', 'pytorch', 'tensorflow', 'machine learning', 'fastapi', 'nlp', 'data science'],
        interests: ['ai/ml', 'education', 'agents', 'research'],
        preferredRoles: ['ML Engineer', 'Data Scientist', 'AI Researcher'],
        portfolioLinks: {
          github: 'https://github.com/priyasharma-ai',
          linkedin: 'https://linkedin.com/in/priyasharma-ai',
        },
        experience: [
          {
            title: 'Research Assistant',
            organization: 'Stanford AI Lab (SAIL)',
            duration: '2024 - Present',
            description: 'Evaluating small language model reasoning on synthetic academic benchmarks.',
          },
        ],
        availability: { hoursPerWeek: 15, status: 'actively-looking' },
        reputationScore: 185,
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@berkeley.edu',
        password: 'Password123!',
        role: 'student',
        isVerified: true,
        college: 'UC Berkeley',
        course: 'Cognitive Science & Design',
        year: '2nd Year',
        bio: 'Product designer and frontend developer obsessed with micro-interactions, clean typography, accessible design systems, and Figma.',
        skills: ['ui/ux', 'figma', 'react', 'tailwind', 'css', 'design systems', 'prototyping'],
        interests: ['design', 'human computer interaction', 'web apps', 'creative coding'],
        preferredRoles: ['UI/UX Designer', 'Frontend Developer', 'Product Designer'],
        portfolioLinks: {
          github: 'https://github.com/marcuschen-design',
          website: 'https://marcuschen.design',
        },
        availability: { hoursPerWeek: 18, status: 'actively-looking' },
        reputationScore: 145,
      },
      {
        name: 'Elena Rostova',
        email: 'elena@cmu.edu',
        password: 'Password123!',
        role: 'student',
        isVerified: true,
        college: 'Carnegie Mellon University',
        course: 'Computer Engineering',
        year: '4th Year',
        bio: 'Low-level systems enthusiast, competitive capture-the-flag hacker, and cloud infrastructure tinkerer.',
        skills: ['c++', 'rust', 'golang', 'linux', 'cybersecurity', 'kubernetes', 'aws'],
        interests: ['cybersecurity', 'systems', 'cloud infrastructure', 'networking'],
        preferredRoles: ['DevOps Engineer', 'Security Engineer', 'Backend Developer'],
        availability: { hoursPerWeek: 12, status: 'open-to-offers' },
        reputationScore: 130,
      },
      {
        name: 'Jordan Taylor',
        email: 'jordan@nyu.edu',
        password: 'Password123!',
        role: 'student',
        isVerified: true,
        college: 'New York University',
        course: 'Interactive Telecommunications',
        year: '3rd Year',
        bio: 'Cross-platform mobile developer who turns napkin sketches into smooth iOS & Android apps using Flutter and React Native.',
        skills: ['flutter', 'react native', 'dart', 'javascript', 'firebase', 'mobile'],
        interests: ['mobile app', 'social impact', 'iot', 'fintech'],
        preferredRoles: ['Mobile Developer', 'App Architect'],
        availability: { hoursPerWeek: 25, status: 'actively-looking' },
        reputationScore: 120,
      },
    ]);

    const [admin, alex, priya, marcus, elena, jordan] = users;

    // 2. Seed Projects & Teams
    console.log('🚀 Seeding projects & team workspaces...');

    // Project 1: EduFlow (Owned by Priya)
    const p1Conv = await Conversation.create({
      type: 'team',
      participants: [priya._id, alex._id, marcus._id],
    });

    const project1 = await Project.create({
      title: 'EduFlow: AI-Powered Adaptive Tutor for STEM Students',
      description:
        'EduFlow is an open-source adaptive learning companion that breaks down complex calculus and computer science concepts into interactive Socratic dialogues and visual step-by-step flash cards. We are training lightweight fine-tuned models and building a polished React web canvas.',
      category: 'AI/ML',
      owner: priya._id,
      requiredSkills: ['react', 'python', 'fastapi', 'tailwind', 'pytorch'],
      openPositions: [
        {
          role: 'Frontend Architect',
          count: 1,
          filled: 1,
          description: 'Build interactive formula renderers and canvas visualizers.',
          requiredSkills: ['react', 'tailwind'],
        },
        {
          role: 'Backend API Engineer',
          count: 1,
          filled: 1,
          description: 'Orchestrate async streaming LLM tokens and vector search caching.',
          requiredSkills: ['python', 'fastapi'],
        },
        {
          role: 'UI/UX Visual Designer',
          count: 1,
          filled: 1,
          description: 'Design distraction-free dark/light reading modes in Figma.',
          requiredSkills: ['ui/ux', 'figma'],
        },
      ],
      teamSize: 4,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'published',
      tags: ['education', 'ai', 'stem', 'react', 'fastapi'],
      githubUrl: 'https://github.com/eduflow-project/eduflow-core',
      liveUrl: 'https://eduflow-demo.vercel.app',
      viewsCount: 142,
    });

    const team1 = await Team.create({
      name: 'EduFlow Core Team',
      description: 'Collaborative development group for EduFlow adaptive tutor platform.',
      leader: priya._id,
      project: project1._id,
      maxMembers: 4,
      members: [
        {
          user: priya._id,
          role: 'Lead ML Researcher / Founder',
          permissions: ['manage_members', 'edit_project', 'chat', 'invite'],
        },
        {
          user: alex._id,
          role: 'Backend & Cloud Engineer',
          permissions: ['chat', 'view_workspace', 'edit_project'],
        },
        {
          user: marcus._id,
          role: 'UI/UX & Frontend Designer',
          permissions: ['chat', 'view_workspace'],
        },
      ],
      chatRoom: p1Conv._id,
      links: {
        github: 'https://github.com/eduflow-project/eduflow-core',
        figma: 'https://figma.com/@eduflow-design',
        docs: 'https://notion.so/eduflow-team-docs',
      },
      status: 'recruiting',
    });

    p1Conv.team = team1._id;
    await p1Conv.save();
    project1.team = team1._id;
    await project1.save();

    // Project 2: CampusRide (Owned by Alex)
    const p2Conv = await Conversation.create({
      type: 'team',
      participants: [alex._id, jordan._id],
    });

    const project2 = await Project.create({
      title: 'CampusRide: Verified Student Carpool & Ride-Sharing Network',
      description:
        'A college-exclusive ride coordination and carpooling service. Reduces suburban commuting expenses and campus parking congestion by pairing students with verified .edu addresses traveling in the same direction.',
      category: 'Mobile App',
      owner: alex._id,
      requiredSkills: ['react native', 'flutter', 'node.js', 'mongodb', 'maps'],
      openPositions: [
        {
          role: 'Mobile Dev Lead',
          count: 1,
          filled: 1,
          description: 'Build native geolocation tracking and trip request screens.',
          requiredSkills: ['flutter', 'react native'],
        },
        {
          role: 'Safety & Verification Specialist',
          count: 1,
          filled: 0,
          description: 'Implement automated college ID validation and trip SOS alerts.',
          requiredSkills: ['node.js', 'security'],
        },
      ],
      teamSize: 4,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'published',
      tags: ['rideshare', 'mobile', 'sustainability', 'campus'],
      githubUrl: 'https://github.com/alexrivera-demo/campus-ride',
      viewsCount: 98,
    });

    const team2 = await Team.create({
      name: 'CampusRide Crew',
      description: 'Building reliable student transportation for university campuses.',
      leader: alex._id,
      project: project2._id,
      maxMembers: 4,
      members: [
        {
          user: alex._id,
          role: 'Team Lead & Backend Architect',
          permissions: ['manage_members', 'edit_project', 'chat', 'invite'],
        },
        {
          user: jordan._id,
          role: 'Mobile App Developer',
          permissions: ['chat', 'view_workspace'],
        },
      ],
      chatRoom: p2Conv._id,
      links: {
        github: 'https://github.com/alexrivera-demo/campus-ride',
        figma: 'https://figma.com/@campusride',
      },
      status: 'recruiting',
    });

    p2Conv.team = team2._id;
    await p2Conv.save();
    project2.team = team2._id;
    await project2.save();

    // Project 3: CodeSphere (Owned by Marcus)
    const project3 = await Project.create({
      title: 'CodeSphere: Collaborative In-Browser Code Pair-Programming Suite',
      description:
        'Web-based Monaco code editor powered by WebSockets and CRDTs for frictionless pair programming interviews, peer code reviews, and live student tutorials without installing bulky tools.',
      category: 'Web App',
      owner: marcus._id,
      requiredSkills: ['react', 'node.js', 'socket.io', 'typescript'],
      openPositions: [
        {
          role: 'WebSocket Realtime Engineer',
          count: 1,
          filled: 0,
          description: 'Implement zero-latency CRDT synchronization for multi-cursor edits.',
          requiredSkills: ['node.js', 'socket.io'],
        },
      ],
      teamSize: 3,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'published',
      tags: ['developer-tools', 'collaboration', 'websockets'],
      viewsCount: 76,
    });

    // Project 4: EcoTrack (Owned by Elena)
    const project4 = await Project.create({
      title: 'EcoTrack: Campus Energy & Carbon Footprint Telemetry',
      description:
        'Real-time IoT telemetry monitor capturing departmental energy waste, solar generation metrics, and building water usage across university campuses.',
      category: 'IoT / Hardware',
      owner: elena._id,
      requiredSkills: ['python', 'c++', 'react', 'data science', 'linux'],
      openPositions: [
        {
          role: 'Frontend Data Viz Engineer',
          count: 1,
          filled: 0,
          description: 'Build real-time charts and spatial sensor maps using Recharts.',
          requiredSkills: ['react'],
        },
      ],
      teamSize: 3,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'published',
      tags: ['iot', 'sustainability', 'hardware', 'telemetry'],
      viewsCount: 52,
    });

    // 3. Seed Hackathons
    console.log('🏆 Seeding hackathons...');
    await Hackathon.create([
      {
        title: 'HackMIT 2026: Global Student Builder Sprint',
        tagline: '1,000+ Students. 36 Hours. Infinite Breakthroughs.',
        description:
          'HackMIT is MIT’s premier annual collegiate hackathon. Build groundbreaking prototypes across Artificial Intelligence, Sustainable Technologies, and Web3 infrastructure with mentors from Google, OpenAI, and Y Combinator.',
        organizer: 'MIT TechX & Student Council',
        creator: admin._id,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        websiteUrl: 'https://hackmit.org',
        mode: 'Hybrid',
        location: 'MIT Stata Center (Cambridge, MA) + Online Discord',
        themes: ['AI & ML', 'Climate & Energy', 'Developer Tools', 'Open Innovation'],
        prizes: [
          { place: 'Grand Prize Winner', reward: '$12,000', description: 'Cash grant + Seed fund pitch opportunity' },
          { place: 'Best Social Impact Hack', reward: '$5,000', description: 'Nonprofit deployment grant' },
          { place: 'Best UI/UX Design', reward: '$3,000', description: 'Hardware gear + Mentorship' },
        ],
        participants: [alex._id, priya._id, marcus._id, jordan._id],
        teams: [team1._id],
        status: 'upcoming',
      },
      {
        title: 'CalHacks 12.0: The World’s Largest Collegiate Hackathon',
        tagline: 'Bring your wildest ideas to life in the heart of the SF Bay Area.',
        description:
          'Join over 2,500 builders at California Memorial Stadium or virtually from anywhere in the world. Compete for over $100k in developer grants, cloud credits, and hardware prizes.',
        organizer: 'Cal Hacks Student Organization',
        creator: admin._id,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        websiteUrl: 'https://calhacks.io',
        mode: 'Hybrid',
        location: 'UC Berkeley Memorial Stadium',
        themes: ['AI Agents', 'Health Tech', 'Fintech', 'Hardware'],
        prizes: [
          { place: '1st Overall', reward: '$20,000', description: 'Direct accelerator interview' },
          { place: 'Runner Up', reward: '$8,000', description: 'Cash prize' },
        ],
        participants: [marcus._id, elena._id],
        status: 'upcoming',
      },
    ]);

    // 4. Seed Applications
    console.log('📋 Seeding applications...');
    await Application.create([
      {
        project: project1._id,
        applicant: alex._id,
        role: 'Backend API Engineer',
        pitch:
          'Hey Priya! I have 3 years of experience building Node and Python backend services, and built streaming APIs during my internship at Stripe. I would love to build EduFlow’s high-performance LLM ingestion pipeline!',
        skills: ['python', 'node.js', 'fastapi', 'docker'],
        status: 'accepted',
        feedback: 'Fantastic background with distributed systems. Excited to have you on board!',
        reviewedAt: new Date(),
      },
      {
        project: project1._id,
        applicant: marcus._id,
        role: 'UI/UX Visual Designer',
        pitch:
          'Hi Priya! I specialize in clean mathematical visualizers and educational interfaces. I can design the full interaction model in Figma and build the React Tailwind components.',
        skills: ['ui/ux', 'figma', 'react', 'tailwind'],
        status: 'accepted',
        feedback: 'Your design portfolio is stunning. Welcome to the team!',
        reviewedAt: new Date(),
      },
      {
        project: project2._id,
        applicant: jordan._id,
        role: 'Mobile Dev Lead',
        pitch:
          'I build smooth Flutter and React Native mobile apps. Having reliable student carpooling on campus is an urgent need, and I have ready-made geolocation and mapping modules.',
        skills: ['flutter', 'react native', 'maps'],
        status: 'accepted',
        feedback: 'Great mobile architecture skills! Let’s ship this together.',
        reviewedAt: new Date(),
      },
      {
        project: project3._id,
        applicant: elena._id,
        role: 'WebSocket Realtime Engineer',
        pitch:
          'I have worked extensively with low-latency network sockets and concurrency. I would love to help optimize the collaborative CRDT engine in CodeSphere.',
        skills: ['golang', 'c++', 'linux', 'networking'],
        status: 'pending',
      },
    ]);

    // 5. Seed Messages in Team Chat
    console.log('💬 Seeding chat messages...');
    await Message.create([
      {
        conversation: p1Conv._id,
        sender: priya._id,
        content: 'Hey team! Welcome to the EduFlow workspace. Excited to kick off our MVP sprint!',
        readBy: [priya._id, alex._id, marcus._id],
      },
      {
        conversation: p1Conv._id,
        sender: alex._id,
        content: 'Excited to be here! I set up our Docker compose file and the initial FastAPI endpoints.',
        readBy: [priya._id, alex._id, marcus._id],
      },
      {
        conversation: p1Conv._id,
        sender: marcus._id,
        content: 'Awesome! I just pushed the Figma component library link to our workspace links tab.',
        readBy: [priya._id, alex._id, marcus._id],
      },
    ]);

    p1Conv.lastMessageAt = new Date();
    await p1Conv.save();

    // Seed 1 private conversation between Alex and Priya
    const privateConv = await Conversation.create({
      type: 'private',
      participants: [alex._id, priya._id],
    });

    const privMsg = await Message.create({
      conversation: privateConv._id,
      sender: alex._id,
      content: 'Hey Priya! Thanks for checking my application. Are you free for a quick sync tomorrow regarding the vector database selection?',
      readBy: [alex._id, priya._id],
    });

    privateConv.lastMessage = privMsg._id;
    privateConv.lastMessageAt = new Date();
    await privateConv.save();

    // 6. Seed Skill Sharing Sessions
    console.log('💡 Seeding skill sharing sessions...');
    await SkillSession.create([
      {
        provider: priya._id,
        requester: alex._id,
        skill: 'PyTorch & Fine-Tuning',
        topic: 'Intro to HuggingFace LoRA fine-tuning for lightweight models',
        description: 'Wanted to understand parameter-efficient fine-tuning on academic datasets.',
        proposedDurationMinutes: 60,
        preferredTime: 'Thursday 4:00 PM EST',
        meetingLink: 'https://meet.google.com/gittogether-sample-session',
        status: 'accepted',
        notes: 'Covered LoRA rank selection, quantized training, and validation checkpoints.',
      },
      {
        provider: marcus._id,
        requester: jordan._id,
        skill: 'Figma Auto-Layout & Design Systems',
        topic: 'Building responsive mobile UI components with tokenized variables',
        description: 'Need help making Flutter UI mockups adapt cleanly across screen ratios.',
        proposedDurationMinutes: 45,
        preferredTime: 'Friday 2:00 PM EST',
        status: 'completed',
        notes: 'Walked through 8pt grid system, fluid typography, and component variant states.',
      },
    ]);

    // 7. Seed Reviews
    console.log('⭐ Seeding reviews...');
    await Review.create([
      {
        reviewer: alex._id,
        reviewee: priya._id,
        project: project1._id,
        team: team1._id,
        rating: 5,
        collaborationSkillsRating: 5,
        communicationRating: 5,
        punctualityRating: 5,
        comment:
          'Priya is an incredible project lead! Extremely clear vision, supportive feedback, and deep technical knowledge in machine learning.',
      },
      {
        reviewer: priya._id,
        reviewee: alex._id,
        project: project1._id,
        team: team1._id,
        rating: 5,
        collaborationSkillsRating: 5,
        communicationRating: 5,
        punctualityRating: 5,
        comment:
          'Alex delivered rock-solid backend endpoints ahead of schedule. Exceptional engineering practices and proactive communication.',
      },
    ]);

    // 8. Seed Notifications
    console.log('🔔 Seeding notifications...');
    await Notification.create([
      {
        recipient: alex._id,
        sender: priya._id,
        type: 'application_status',
        title: 'Application Accepted! 🎉',
        message: 'Congratulations! You were accepted into "EduFlow" as Backend API Engineer.',
        link: `/projects/${project1._id}`,
        isRead: true,
      },
      {
        recipient: alex._id,
        sender: priya._id,
        type: 'review_received',
        title: 'New Peer Review Received ⭐',
        message: 'Priya Sharma gave you a 5-star collaboration review for "EduFlow".',
        link: `/students/${alex._id}`,
        isRead: false,
      },
      {
        recipient: priya._id,
        sender: alex._id,
        type: 'message',
        title: 'New Message from Alex Rivera',
        message: 'Hey Priya! Thanks for checking my application...',
        link: '/messages',
        isRead: false,
      },
    ]);

    console.log('\n==================================================');
    console.log('✅ Git Together Database successfully seeded with demo data!');
    console.log('--------------------------------------------------');
    console.log('Demo Accounts:');
    console.log('1. Admin:   admin@gittogether.edu   (Password: Password123!)');
    console.log('2. Student: alex@mit.edu       (Password: Password123!)');
    console.log('3. Student: priya@stanford.edu (Password: Password123!)');
    console.log('4. Student: marcus@berkeley.edu(Password: Password123!)');
    console.log('==================================================\n');

    await closeDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    await closeDB();
    process.exit(1);
  }
};

seedDatabase();
