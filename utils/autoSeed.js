const Role = require('../models/Role');
const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');
const User = require('../models/User');

const autoSeed = async () => {
  try {
    let superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superAdminRole) superAdminRole = await Role.create({ name: 'SuperAdmin' });

    let userRole = await Role.findOne({ name: 'User' });
    if (!userRole) userRole = await Role.create({ name: 'User' });

    let staffRole = await Role.findOne({ name: 'Staff' });
    if (!staffRole) staffRole = await Role.create({ name: 'Staff' });

    let plumberRole = await Role.findOne({ name: 'Plumber' });
    if (!plumberRole) plumberRole = await Role.create({ name: 'Plumber' });

    let techRole = await Role.findOne({ name: 'Technician' });
    if (!techRole) techRole = await Role.create({ name: 'Technician' });

    let adminDept = await Department.findOne({ shortName: 'ADMIN' });
    if (!adminDept) {
      adminDept = await Department.create({ name: 'Administration', shortName: 'ADMIN' });
    }

    let genProg = await Programme.findOne({ shortName: 'GEN' });
    if (!genProg) {
      genProg = await Programme.create({ department: adminDept._id, name: 'General Administration', shortName: 'GEN' });
    }

    let mainBlock = await Block.findOne({ name: 'Main Block' });
    if (!mainBlock) {
      mainBlock = await Block.create({ department: adminDept._id, programme: genProg._id, name: 'Main Block' });
    }

    let room101 = await Room.findOne({ roomNumber: '101' });
    if (!room101) {
      await Room.create({
        department: adminDept._id,
        programme: genProg._id,
        block: mainBlock._id,
        roomNumber: '101',
      });
    }

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
      console.log('✅ Default SuperAdmin created: admin@tms.com / admin123');
    }

    let existingPlumber = await User.findOne({ email: 'plumber@tms.com' });
    if (!existingPlumber) {
      const plumberUser = await User.create({
        userName: 'Ramesh (Plumber)',
        phoneNumber: '9876543211',
        email: 'plumber@tms.com',
        password: 'plumber123',
        role: plumberRole._id,
        department: adminDept._id,
        programme: genProg._id,
      });
      console.log('✅ Plumber Staff created: plumber@tms.com / plumber123');

      // Create a sample complaint assigned to Plumber so user can test status update immediately
      const Complaint = require('../models/Complaint');
      const sampleComplaint = await Complaint.findOne({ complaintType: 'Plumbing' });
      if (!sampleComplaint) {
        await Complaint.create({
          block: mainBlock._id,
          room: room101._id,
          complaintType: 'Plumbing',
          remarks: 'Water leakage in Room 101 sink',
          status: 'Assigned',
          assignedTo: plumberUser._id,
          raisedBy: existingAdmin ? existingAdmin._id : null,
          department: adminDept._id,
          programme: genProg._id,
          statusHistory: [
            { status: 'Pending', note: 'Complaint raised' },
            { status: 'Assigned', note: 'Assigned to Plumber' },
          ],
        });
        console.log('✅ Sample assigned complaint created for Plumber test');
      }
    }

    let existingTech = await User.findOne({ email: 'tech@tms.com' });
    if (!existingTech) {
      await User.create({
        userName: 'Suresh (Technician)',
        phoneNumber: '9876543212',
        email: 'tech@tms.com',
        password: 'tech123',
        role: techRole._id,
        department: adminDept._id,
        programme: genProg._id,
      });
      console.log('✅ Technician Staff created: tech@tms.com / tech123');
    }
  } catch (err) {
    console.warn('AutoSeed notice:', err.message);
  }
};

module.exports = autoSeed;

