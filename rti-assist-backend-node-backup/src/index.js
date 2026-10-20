import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import { db } from './data/store.js';

import authRoutes from './routes/authRoutes.js';
import authorityRoutes from './routes/authorityRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import deadlineRoutes from './routes/deadlineRoutes.js';
import appealRoutes from './routes/appealRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for seamless local dev & mentor demo
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Root Status & Health Check
app.get('/', (req, res) => {
  res.json({
    name: 'RTI Assist Backend API',
    status: 'ONLINE',
    version: '1.0.0',
    port: config.port,
    geminiAi: {
      configured: Boolean(config.geminiApiKey),
      model: config.geminiModel,
      status: config.geminiApiKey
        ? 'Active (Google Gemini)'
        : 'Fallback Mode Active (Paste GEMINI_API_KEY in .env to enable live Gemini)',
    },
    counts: {
      authorities: db.getAuthorities().length,
      cases: db.getCases().length,
      deadlines: db.getDeadlines().length,
    },
    documentation: 'See BACKEND_HANDOVER_REPORT.md in frontend directory',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(config.geminiApiKey),
    model: config.geminiModel,
    casesCount: db.getCases().length,
    authoritiesCount: db.getAuthorities().length,
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/authorities', authorityRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api', aiRoutes);
app.use('/', aiRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `API endpoint ${req.method} ${req.originalUrl} not found`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Error Handler]', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    code: err.code || 'SERVER_ERROR',
    message: err.message || 'An unexpected internal server error occurred',
  });
});

// Start Server
app.listen(config.port, () => {
  console.log('================================================================');
  console.log(`🚀 RTI ASSIST BACKEND RUNNING ON http://localhost:${config.port}`);
  console.log('================================================================');
  console.log(`📡 Base API URL:      http://localhost:${config.port}/api`);
  console.log(`🔑 Gemini AI Key:     ${config.geminiApiKey ? '✅ Configured (' + config.geminiModel + ')' : '⚠️  Not Set (Using Smart Legal Engine fallback)'}`);
  console.log(`📂 Pre-seeded Records: ${db.getAuthorities().length} Authorities | ${db.getCases().length} Cases`);
  console.log('----------------------------------------------------------------');
  console.log('💡 Quick Tips:');
  console.log('   - To add Gemini key, open: rti-assist-backend/.env');
  console.log('   - Frontend connects automatically to http://localhost:8000/api');
  console.log('================================================================');
});
