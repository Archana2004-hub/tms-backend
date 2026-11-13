const Department = require('../models/Department');
const Programme  = require('../models/Programme');
const Block      = require('../models/Block');
const Room       = require('../models/Room');
const Role       = require('../models/Role');

const crudFor = (Model, populateFields = '') => ({
  getAll: async (req, res) => {
    try {
      let query = Model.find({ isActive: true });
      if (populateFields) query = query.populate(populateFields);
      const data = await query.sort({ createdAt: -1 });
      res.json({ success: true, count: data.length, data });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  },
  getOne: async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      if (populateFields) query = query.populate(populateFields);
      const item = await query;
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: item });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  },
  create: async (req, res) => {
    try {
      // Clean up any previously soft-deleted inactive document with the same key
      if (req.body.shortName) {
        await Model.deleteMany({
          shortName: new RegExp(`^${req.body.shortName.trim()}$`, 'i'),
          isActive: false,
        });
      }
      if (req.body.name) {
        await Model.deleteMany({
          name: new RegExp(`^${req.body.name.trim()}$`, 'i'),
          isActive: false,
        });
      }

      if (Model === Room && req.body.block) {
        const blk = await Block.findById(req.body.block);
        if (blk) {
          if (!req.body.department) req.body.department = blk.department;
          if (!req.body.programme && blk.programme) req.body.programme = blk.programme;
        }
      }
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      if (err.code === 11000) {
        const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
        const val = err.keyValue ? err.keyValue[key] : '';
        const fieldName = key === 'shortName' ? 'Short Name' : key === 'name' ? 'Name' : key;
        return res.status(400).json({
          success: false,
          message: `${fieldName} '${val}' already exists. Please use a different ${fieldName}.`,
        });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },
  update: async (req, res) => {
    try {
      if (Model === Room && req.body.block) {
        const blk = await Block.findById(req.body.block);
        if (blk) {
          if (!req.body.department) req.body.department = blk.department;
          if (!req.body.programme && blk.programme) req.body.programme = blk.programme;
        }
      }
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: item });
    } catch (err) {
      if (err.code === 11000) {
        const key = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
        const val = err.keyValue ? err.keyValue[key] : '';
        const fieldName = key === 'shortName' ? 'Short Name' : key === 'name' ? 'Name' : key;
        return res.status(400).json({
          success: false,
          message: `${fieldName} '${val}' already exists. Please use a different ${fieldName}.`,
        });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },
  remove: async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }
});

exports.department = crudFor(Department);
exports.programme  = crudFor(Programme,  'department');
exports.block      = crudFor(Block,      'department programme');
exports.room       = crudFor(Room,       'department programme block');
exports.role       = crudFor(Role);
