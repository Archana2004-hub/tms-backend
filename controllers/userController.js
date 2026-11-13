const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true })
      .populate('role', 'name')
      .populate('department', 'name shortName')
      .populate('programme', 'name shortName')
      .select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role department programme').select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createUser = async (req, res) => {
  try {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      if (!exists.isActive) {
        await User.findByIdAndDelete(exists._id);
      } else {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
    }
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: { ...user.toObject(), password: undefined } });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { userName, phoneNumber, email, role, department, programme, isActive, password } = req.body;

    if (userName !== undefined) user.userName = userName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (email !== undefined) {
      if (email !== user.email) {
        const exists = await User.findOne({ email });
        if (exists && exists._id.toString() !== user._id.toString()) {
          return res.status(400).json({ success: false, message: 'Email already registered' });
        }
      }
      user.email = email;
    }
    if (role !== undefined) user.role = role;
    if (department !== undefined) user.department = department;
    if (programme !== undefined) user.programme = programme;
    if (isActive !== undefined) user.isActive = isActive;

    if (password && typeof password === 'string' && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
      }
      user.password = password.trim();
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .populate('role department programme')
      .select('-password');

    res.json({ success: true, data: updatedUser });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
