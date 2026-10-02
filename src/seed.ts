/**
 * Seed script. Never deletes or overwrites existing data - it only creates
 * records that are missing (matched by email / company name / ground name).
 *
 *   yarn seed:admin   creates the first super_admin and the default sports (safe for production)
 *   yarn seed:sports  creates the default sports, and one for every sport key grounds already use
 *   yarn seed:demo    creates demo owner/maintainer/customer, companies and grounds
 *
 * Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (and optional SEED_ADMIN_NAME).
 */
import mongoose from 'mongoose';
import config from './app/config';
import { User } from './app/modules/user/user.model';
import { TurfCompany } from './app/modules/turfCompany/turfCompany.model';
import { Ground } from './app/modules/ground/ground.model';
import { Sport } from './app/modules/sport/sport.model';

const DEMO_PASSWORD = 'password123';

const log = (msg: string) => console.log(msg);

async function ensureUser(data: {
  name: string;
  email: string;
  phoneNumber?: string;
  password: string;
  role: 'super_admin' | 'turf_owner' | 'maintainer' | 'user';
}) {
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    log(`  = user exists: ${data.email} (${existing.role})`);
    return existing;
  }
  const user = await User.create(data); // pre-save hook hashes the password
  log(`  + user created: ${data.email} (${data.role})`);
  return user;
}

const DEFAULT_SPORTS = [
  { key: 'football', en: 'Football', bn: 'ফুটবল', icon: '⚽' },
  { key: 'cricket', en: 'Cricket', bn: 'ক্রিকেট', icon: '🏏' },
  { key: 'futsal', en: 'Futsal', bn: 'ফুটসাল', icon: '🥅' },
  { key: 'table-tennis', en: 'Table Tennis', bn: 'টেবিল টেনিস', icon: '🏓' },
  { key: 'badminton', en: 'Badminton', bn: 'ব্যাডমিন্টন', icon: '🏸' },
  { key: 'tennis', en: 'Tennis', bn: 'টেনিস', icon: '🎾' },
  { key: 'volleyball', en: 'Volleyball', bn: 'ভলিবল', icon: '🏐' },
  { key: 'basketball', en: 'Basketball', bn: 'বাস্কেটবল', icon: '🏀' },
];

const titleCase = (key: string) =>
  key.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

async function ensureSport(key: string, name: { en: string; bn?: string }, icon: string | undefined, order: number) {
  if (await Sport.exists({ key })) {
    log(`  = sport exists: ${key}`);
    return;
  }
  await Sport.create({ key, name, icon, order });
  log(`  + sport created: ${key}`);
}

// Defaults first, then any key already stored on a ground (free text from before sports were managed)
async function seedSports() {
  for (const [i, s] of DEFAULT_SPORTS.entries()) {
    await ensureSport(s.key, { en: s.en, bn: s.bn }, s.icon, i);
  }
  const used: string[] = await Ground.distinct('sports');
  for (const key of used) {
    const normalised = key.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (normalised && normalised === key) {
      await ensureSport(key, { en: titleCase(key) }, undefined, DEFAULT_SPORTS.length);
    } else {
      log(`  ! ground sport "${key}" is not a valid key - fix it on the ground`);
    }
  }
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the super admin');
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters');
  }
  await ensureUser({
    name: process.env.SEED_ADMIN_NAME || 'Super Admin',
    email,
    password,
    role: 'super_admin',
  });
  await seedSports();
}

async function ensureCompany(name: string, address: string, ownerId: mongoose.Types.ObjectId) {
  let company = await TurfCompany.findOne({ name, ownerId });
  if (company) {
    log(`  = company exists: ${name}`);
  } else {
    company = await TurfCompany.create({ name, address, ownerId });
    log(`  + company created: ${name}`);
  }
  await User.updateOne({ _id: ownerId }, { $addToSet: { companies: company._id } });
  return company;
}

async function ensureGround(
  companyId: mongoose.Types.ObjectId,
  data: Record<string, any>
) {
  const existing = await Ground.findOne({ companyId, name: data.name });
  if (existing) {
    log(`  = ground exists: ${data.name}`);
    return existing;
  }
  const ground = await Ground.create({ ...data, companyId });
  log(`  + ground created: ${data.name}`);
  return ground;
}

async function seedDemo() {
  if (config.env === 'production' && process.env.SEED_ALLOW_PRODUCTION !== 'true') {
    throw new Error('Refusing to seed demo data in production (set SEED_ALLOW_PRODUCTION=true to override)');
  }

  await seedSports();

  const owner = await ensureUser({
    name: 'Demo Owner',
    email: 'owner@turfbari.com',
    phoneNumber: '+8801700000001',
    password: DEMO_PASSWORD,
    role: 'turf_owner',
  });
  const maintainer = await ensureUser({
    name: 'Demo Maintainer',
    email: 'maintainer@turfbari.com',
    phoneNumber: '+8801700000002',
    password: DEMO_PASSWORD,
    role: 'maintainer',
  });
  await ensureUser({
    name: 'Demo Customer',
    email: 'user@turfbari.com',
    phoneNumber: '+8801700000003',
    password: DEMO_PASSWORD,
    role: 'user',
  });

  const greenField = await ensureCompany('Green Field Turf', 'Dhanmondi, Dhaka', owner._id);
  const sportsArena = await ensureCompany('Sports Arena', 'Uttara, Dhaka', owner._id);
  // Maintainer works in both companies (will pick one after login)
  await User.updateOne(
    { _id: maintainer._id },
    { $addToSet: { companies: { $each: [greenField._id, sportsArena._id] } } }
  );

  await ensureGround(greenField._id, {
    name: 'Main Ground',
    description: 'Floodlit turf, suitable for 7-a-side',
    sports: ['cricket', 'football'],
    slotDuration: 90,
    advancePayment: true,
    operatingHours: { start: '06:00', end: '23:00' },
    pricingConfig: {
      basePrice: 1500,
      timeBands: [
        { name: 'Morning', startTime: '06:00', endTime: '12:00', prices: { sun: 1200, mon: 1200, tue: 1200, wed: 1200, thu: 1200, fri: 1800, sat: 1800 } },
        { name: 'Afternoon', startTime: '12:00', endTime: '17:00', prices: { sun: 1500, mon: 1500, tue: 1500, wed: 1500, thu: 1500, fri: 2200, sat: 2200 } },
        { name: 'Evening', startTime: '17:00', endTime: '23:00', prices: { sun: 2000, mon: 2000, tue: 2000, wed: 2000, thu: 2000, fri: 2600, sat: 2600 } },
      ],
    },
  });
  await ensureGround(greenField._id, {
    name: 'Mini Turf',
    description: '5-a-side football',
    sports: ['football'],
    slotDuration: 60,
    advancePayment: false,
    operatingHours: { start: '08:00', end: '22:00' },
    pricingConfig: {
      basePrice: 1000,
      timeBands: [{ name: 'All day', startTime: '08:00', endTime: '22:00', prices: { fri: 1400, sat: 1400 } }],
    },
  });
  await ensureGround(sportsArena._id, {
    name: 'Arena Ground',
    description: 'Cricket nets and open ground',
    sports: ['cricket'],
    slotDuration: 120,
    advancePayment: true,
    operatingHours: { start: '07:00', end: '21:00' },
    pricingConfig: {
      basePrice: 2500,
      timeBands: [{ name: 'All day', startTime: '07:00', endTime: '21:00', prices: { fri: 3200, sat: 3200 } }],
    },
  });

  log(`\nDemo logins (password: ${DEMO_PASSWORD}):`);
  log('  owner@turfbari.com, maintainer@turfbari.com, user@turfbari.com');
}

async function main() {
  const mode = process.argv[2];
  if (mode !== 'admin' && mode !== 'demo' && mode !== 'sports') {
    console.error('Usage: seed.ts <admin|demo|sports>');
    process.exit(1);
  }

  await mongoose.connect(config.database_url);
  const { host, name } = mongoose.connection;
  log(`Connected to ${host}/${name} (NODE_ENV=${config.env}) - seeding "${mode}" (existing data is never modified)\n`);

  if (mode === 'admin') await seedAdmin();
  else if (mode === 'sports') await seedSports();
  else await seedDemo();

  log('\nDone.');
}

main()
  .catch((err) => {
    console.error(`\nSeed failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
