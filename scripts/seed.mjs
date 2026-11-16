import mongoose from 'mongoose';
import connectDB from '../server/config/database.js';
import { seedDatabase } from '../server/utils/seed.js';
import { operatorTarget } from './operator-target.mjs';
import fs from 'node:fs/promises';

try {
  const target = operatorTarget();
  console.log(JSON.stringify({ database: target.database, mode: target.apply ? 'apply' : 'dry-run', records: 'existing repository starter content only; no customer records or admin' }));
  if (!(await connectDB({ attempts: 1 }))) throw new Error('Database unavailable');
  if (target.apply) {
    // Create declared indexes, never sync/drop existing indexes or collections.
    for (const file of await fs.readdir(new URL('../server/models/', import.meta.url))) {
      if (file.endsWith('.js')) await import(new URL('../server/models/' + file, import.meta.url));
    }
    for (const Model of Object.values(mongoose.models)) await Model.createIndexes();
  }
  console.log(JSON.stringify(await seedDatabase({ apply: target.apply })));
} catch (err) {
  console.error('Initialization failed:', /^(Pass |Initialization accepts|Writes require|Database unavailable)/.test(err.message) ? err.message : 'Inspect configuration and seed schema; no success claimed.');
  process.exitCode = 1;
} finally { await mongoose.disconnect(); }
