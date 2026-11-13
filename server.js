const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/programmes',  require('./routes/programmeRoutes'));
app.use('/api/blocks',      require('./routes/blockRoutes'));
app.use('/api/rooms',       require('./routes/roomRoutes'));
app.use('/api/roles',       require('./routes/roleRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/complaints',  require('./routes/complaintRoutes'));
app.use('/api/reports',     require('./routes/reportRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'TMS API running' }));

// Connect DB and start server
const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas (IPv4 mode)...');
    await mongoose.connect(process.env.MONGO_URI, { family: 4, serverSelectionTimeoutMS: 15000 });
    console.log(' MongoDB Atlas connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    process.exit(1);
  }

  await require('./utils/autoSeed')();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
};

startServer();
