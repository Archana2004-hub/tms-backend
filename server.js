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
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const programmeRoutes = require('./routes/programmeRoutes');
const blockRoutes = require('./routes/blockRoutes');
const roomRoutes = require('./routes/roomRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Support both /api/* and /* (supports mobile APKs configured with or without /api suffix)
app.use('/api/auth',        authRoutes);
app.use('/auth',            authRoutes);

app.use('/api/departments', departmentRoutes);
app.use('/departments',     departmentRoutes);

app.use('/api/programmes',  programmeRoutes);
app.use('/programmes',      programmeRoutes);

app.use('/api/blocks',      blockRoutes);
app.use('/blocks',          blockRoutes);

app.use('/api/rooms',       roomRoutes);
app.use('/rooms',           roomRoutes);

app.use('/api/roles',       roleRoutes);
app.use('/roles',           roleRoutes);

app.use('/api/users',       userRoutes);
app.use('/users',           userRoutes);

app.use('/api/complaints',  complaintRoutes);
app.use('/complaints',      complaintRoutes);

app.use('/api/reports',     reportRoutes);
app.use('/reports',         reportRoutes);

// Health check
app.get(['/', '/api', '/health', '/api/health'], (req, res) =>
  res.json({ status: 'TMS API running', ok: true })
);

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
