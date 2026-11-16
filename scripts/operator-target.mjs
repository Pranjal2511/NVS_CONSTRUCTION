import env from '../server/config/env.js';

export function operatorTarget(args = process.argv.slice(2)) {
  const value = flag => args[args.indexOf(flag) + 1];
  const database = args.includes('--database') ? value('--database') : '';
  const uri = env.MONGODB_URI;
  const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
  if (!database || !match || decodeURIComponent(match[1]) !== database) throw new Error('Pass --database with the exact database name in MONGODB_URI');
  if (env.IS_PRODUCTION || (database !== 'nvs_buildcon' && !/^nvs_[a-z0-9_]+_(dev|test)$/.test(database))) throw new Error('Initialization accepts only the operator-approved nvs_buildcon or nvs_*_dev / nvs_*_test databases outside production');
  const apply = args.includes('--apply');
  if (apply && (!args.includes('--confirm') || value('--confirm') !== database)) throw new Error('Writes require --apply --confirm with the exact database name');
  return { database, apply };
}
