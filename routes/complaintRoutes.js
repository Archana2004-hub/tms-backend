const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const isStaffOrAdmin = (req, res, next) => {
  const role = (req.user?.role?.name || '').trim().toLowerCase();
  if (role === 'user') {
    return res.status(403).json({ success: false, message: 'Users cannot update complaint status' });
  }
  next();
};

router.get('/dashboard',          protect, ctrl.getDashboard);
router.get('/',                   protect, ctrl.getComplaints);
router.post('/',                  protect, upload.single('attachment'), ctrl.createComplaint);
router.get('/:id',                protect, ctrl.getComplaintById);
router.patch('/:id/assign',       protect, authorize('SuperAdmin'), ctrl.assignComplaint);
router.patch('/:id/status',       protect, isStaffOrAdmin, ctrl.updateStatus);
module.exports = router;
