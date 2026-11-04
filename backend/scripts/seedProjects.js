import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import connectDB from '../config/db.js';
import User from '../models/User.model.js';
import Project from '../models/Project.model.js';
import Membership from '../models/Membership.model.js';
import { seedOwners, seedProjects } from './seedData.js';

const SEED_PASSWORD = process.env.SEED_PASSWORD || 'demo-password-123';
const isProduction = process.env.NODE_ENV === 'production';
const force = process.argv.includes('--force');

const ensureOwner = async (owner, passwordHash) => {
  const existing = await User.findOne({ email: owner.email });
  if (existing) {
    await User.updateOne({ _id: existing._id }, { $set: { name: owner.name } });
    return existing;
  }
  return User.create({
    name: owner.name,
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
    await Membership.deleteMany({ projectId: { $in: previousProjectIds } });
    await Project.deleteMany({ _id: { $in: previousProjectIds } });
  }

  for (const data of seedProjects) {
    const owner = ownersByEmail.get(data.ownerEmail);
    if (!owner) {
      throw new Error(`Unknown seed owner: ${data.ownerEmail}`);
    }

    const teamSize = data.teamSize;
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
      applicantCount: data.applicantCount,
      milestones: data.milestones || [],
      status: 'Recruiting',
      visibility: 'public',
      joinPolicy: 'approval',
    });

    await Membership.create({
      projectId: project._id,
      userId: owner._id,
      memberRole: 'Owner',
      status: 'Active',
    });

    const createdAt = new Date(
      Date.now() - data.daysAgo * 24 * 60 * 60 * 1000,
    );
    await Project.collection.updateOne(
      { _id: project._id },
      { $set: { createdAt, updatedAt: createdAt } },
    );
  }

  console.log(
    `Seeded ${seedProjects.length} projects across ${seedOwners.length} owners.`,
  );
  console.log(`Seed accounts use the password: ${SEED_PASSWORD}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
