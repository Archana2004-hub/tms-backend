const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const Department = require('./models/Department');
const Programme = require('./models/Programme');
const Block = require('./models/Block');
const Room = require('./models/Room');
const User = require('./models/User');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas (IPv4 mode)...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log(' MongoDB Atlas connected successfully.');

    // 1. Create Roles
    console.log('Setting up Roles...');
    let superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superAdminRole) superAdminRole = await Role.create({ name: 'SuperAdmin' });

    let userRole = await Role.findOne({ name: 'User' });
    if (!userRole) userRole = await Role.create({ name: 'User' });

    let staffRole = await Role.findOne({ name: 'Staff' });
    if (!staffRole) staffRole = await Role.create({ name: 'Staff' });

    // 2. Create Departments
    console.log('Setting up Departments...');
    let adminDept = await Department.findOne({ shortName: 'ADMIN' });
    if (!adminDept) {
      adminDept = await Department.create({ name: 'Administration', shortName: 'ADMIN' });
    }

    let csDept = await Department.findOne({ shortName: 'CS' });
    if (!csDept) {
      csDept = await Department.create({ name: 'Computer Science', shortName: 'CS' });
    }

    // 3. Create Programmes
    console.log('Setting up Programmes...');
    let genProg = await Programme.findOne({ shortName: 'GEN' });
    if (!genProg) {
      genProg = await Programme.create({ department: adminDept._id, name: 'General Administration', shortName: 'GEN' });
    }

    let mcaProg = await Programme.findOne({ shortName: 'MCA' });
    if (!mcaProg) {
      mcaProg = await Programme.create({ department: csDept._id, name: 'Master of Computer Applications', shortName: 'MCA' });
    }

    // 4. Create Block & Room
    console.log('Setting up Blocks & Rooms...');
    let mainBlock = await Block.findOne({ name: 'Main Block' });
    if (!mainBlock) {
      mainBlock = await Block.create({ department: adminDept._id, programme: genProg._id, name: 'Main Block' });
    }

    let room101 = await Room.findOne({ roomNumber: '101' });
    if (!room101) {
      room101 = await Room.create({
        department: adminDept._id,
        programme: genProg._id,
        block: mainBlock._id,
        roomNumber: '101',
      });
    }

    // 5. Create SuperAdmin User
    console.log('Setting up SuperAdmin User...');
    let existingAdmin = await User.findOne({ email: 'admin@tms.com' });
    if (!existingAdmin) {
      await User.create({
        userName: 'Admin',
        phoneNumber: '9876543210',
        email: 'admin@tms.com',
        password: 'admin123',
        role: superAdminRole._id,
        department: adminDept._id,
        programme: genProg._id,
      });
      console.log('SuperAdmin user created successfully.');
    } else {
      console.log('SuperAdmin user already exists.');
    }

    console.log('\n=======================================');
    console.log(' Database Seeded Successfully! ');
    console.log(' Login Credentials:');
    console.log(' Email   : admin@tms.com');
    console.log(' Password: admin123');
    console.log(' Role    : SuperAdmin');
    console.log('=======================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();

