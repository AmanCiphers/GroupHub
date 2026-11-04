import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Membership from '../models/Membership.model.js';
import ProjectRole from '../models/ProjectRole.model.js';
import Application from '../models/Application.model.js';
import { seedOwners, seedProjects } from './seedData.js';

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'demo-password-123';
const isProduction = process.env.NODE_ENV === 'production';
const force = process.argv.includes('--force');

const ownerProfile = (owner) => ({
  name: owner.name,
  username: owner.username,
  headline: owner.headline,
  bio: owner.bio,
  location: owner.location,
  skills: owner.skills,
  links: owner.links,
  availability: owner.availability,
  experienceLevel: owner.experienceLevel,
});

const ensureOwner = async (owner, passwordHash) => {
  const existing = await User.findOne({ email: owner.email });
  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { $set: ownerProfile(owner) },
    );
    return existing;
  }
  return User.create({
    ...ownerProfile(owner),
    email: owner.email,
    password: passwordHash,
  });
};

const run = async () => {
  if (isProduction && !force) {
    console.error(
      'Refusing to seed in production. Re-run with --force if you are sure.',
    );
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const ownersByEmail = new Map();

  for (const owner of seedOwners) {
    const user = await ensureOwner(owner, passwordHash);
    ownersByEmail.set(owner.email, user);
  }

  const ownerIds = [...ownersByEmail.values()].map((user) => user._id);
  const previousProjects = await Project.find({ ownerId: { $in: ownerIds } }).select('_id');
  const previousProjectIds = previousProjects.map((project) => project._id);

  if (previousProjectIds.length > 0) {
    await Application.deleteMany({ projectId: { $in: previousProjectIds } });
    await ProjectRole.deleteMany({ projectId: { $in: previousProjectIds } });
    await Membership.deleteMany({ projectId: { $in: previousProjectIds } });
    await Project.deleteMany({ _id: { $in: previousProjectIds } });
  }

  const ownerList = [...ownersByEmail.values()];
  const applicationStatuses = ['Pending', 'Accepted', 'Rejected'];
  let roleCount = 0;
  let applicationCount = 0;

  for (const [index, data] of seedProjects.entries()) {
    const owner = ownersByEmail.get(data.ownerEmail);
    if (!owner) {
      throw new Error(`Unknown seed owner: ${data.ownerEmail}`);
    }

    const teamSize = data.teamSize;
    const otherOwners = ownerList.filter(
      (candidate) => !candidate._id.equals(owner._id),
    );
    const memberOwners = otherOwners.slice(0, Math.max(0, teamSize - 1));
    const memberIds = new Set(memberOwners.map((member) => member._id.toString()));
    const applicantOwners = otherOwners.filter(
      (candidate) => !memberIds.has(candidate._id.toString()),
    );

    const project = await Project.create({
      ownerId: owner._id,
      title: data.title,
      description: data.description,
      whyBuilding: data.whyBuilding,
      targetAudience: data.targetAudience,
      currentStatus: data.currentStatus,
      category: data.category,
      stage: data.stage,
      commitment: data.commitment,
      compensation: data.compensation,
      experienceLevel: data.experienceLevel,
      skills: data.skills,
      tags: data.tags,
      location: data.location,
      maxTeamSize: data.maxTeamSize,
      teamSize,
      memberCount: teamSize,
      spotsOpen: Math.max(0, data.maxTeamSize - teamSize),
      applicantCount: applicantOwners.length,
      milestones: data.milestones || [],
      status: 'Recruiting',
      visibility: 'public',
      joinPolicy: 'approval',
    });

    const role = await ProjectRole.create({
      projectId: project._id,
      title: `${data.skills[0]} contributor`,
      skills: data.skills.slice(0, 3),
      slots: Math.max(1, data.maxTeamSize - teamSize),
      status: 'Open',
    });
    roleCount += 1;

    await Membership.create({
      projectId: project._id,
      userId: owner._id,
      roleId: role._id,
      memberRole: 'Owner',
      status: 'Active',
    });

    for (const member of memberOwners) {
      await Membership.create({
        projectId: project._id,
        userId: member._id,
        roleId: role._id,
        memberRole: 'Member',
        status: 'Active',
      });
    }

    for (const [applicantIndex, applicant] of applicantOwners.entries()) {
      await Application.create({
        projectId: project._id,
        projectRoleId: role._id,
        applicantId: applicant._id,
        message: `I would love to help with ${data.skills[0]} and learn alongside the team.`,
        status: applicationStatuses[applicantIndex % applicationStatuses.length],
      });
      applicationCount += 1;
    }

    const createdAt = new Date(
      Date.now() - data.daysAgo * 24 * 60 * 60 * 1000,
    );
    await Project.collection.updateOne(
      { _id: project._id },
      { $set: { createdAt, updatedAt: createdAt } },
    );
  }

  console.log(
    `Seeded ${seedProjects.length} projects, ${roleCount} roles, and ${applicationCount} applications across ${seedOwners.length} owners.`,
  );
  console.log(`Seed accounts use the password: ${SEED_PASSWORD}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
