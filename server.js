const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:rleeforum2025@zmgovmbmgaxscjevxzhk.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to Supabase PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  console.error('Connection string used:', process.env.DATABASE_URL || 'postgresql://postgres:rleeforum2025@zmgovmbmgaxscjevxzhk.supabase.co:5432/postgres');
});

// Test initial connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Initial database connection test failed:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
    console.error('Connection details:', {
      host: 'db.zmgovmbmgaxscjevxzhk.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres'
    });
  } else {
    console.log('Initial database connection test successful:', res.rows[0]);
  }
});

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '_' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Initialize database table
async function initializeDatabase() {
  try {
    console.log('Initializing database table...');
    
    // First, check if table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mboard'
      );
    `;
    
    const tableExists = await pool.query(checkTableQuery);
    console.log('Table exists check result:', tableExists.rows[0]);
    
    if (!tableExists.rows[0].exists) {
      console.log('Creating mboard table...');
      const createTableQuery = `
        CREATE TABLE mboard (
          idx SERIAL PRIMARY KEY,
          subject VARCHAR(255) DEFAULT '',
          name VARCHAR(100) DEFAULT '',
          password VARCHAR(255),
          content TEXT,
          hit INTEGER DEFAULT 0,
          imglist VARCHAR(255) DEFAULT '',
          rdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip VARCHAR(100)
        );
      `;
      
      await pool.query(createTableQuery);
      console.log('Database table created successfully');
      
      // Insert sample data
      const sampleDataQuery = `
        INSERT INTO mboard (subject, name, password, content, hit, rdate) VALUES
        ('Welcome to Tech Forum!', 'Admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'This is a sample post. Password is "password".', 0, CURRENT_TIMESTAMP),
        ('Getting Started with Node.js', 'Developer', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Node.js is a powerful JavaScript runtime. This post explains the basics.', 0, CURRENT_TIMESTAMP)
      `;
      
      await pool.query(sampleDataQuery);
      console.log('Sample data inserted successfully');
    } else {
      console.log('Table already exists, skipping creation');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

app.get('/read/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'read.html'));
});

app.get('/update/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'update.html'));
});

// Database table check
app.get('/api/check-table', async (req, res) => {
  try {
    console.log('Checking if mboard table exists...');
    
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mboard'
      );
    `;
    
    const tableExists = await pool.query(checkTableQuery);
    console.log('Table exists check result:', tableExists.rows[0]);
    
    if (tableExists.rows[0].exists) {
      // Check table structure
      const tableInfoQuery = `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'mboard' 
        ORDER BY ordinal_position;
      `;
      
      const tableInfo = await pool.query(tableInfoQuery);
      console.log('Table structure:', tableInfo.rows);
      
      // Check row count
      const rowCountQuery = 'SELECT COUNT(*) as count FROM mboard';
      const rowCount = await pool.query(rowCountQuery);
      console.log('Row count:', rowCount.rows[0]);
      
      res.json({
        tableExists: true,
        structure: tableInfo.rows,
        rowCount: parseInt(rowCount.rows[0].count)
      });
    } else {
      res.json({
        tableExists: false,
        message: 'Table mboard does not exist'
      });
    }
  } catch (error) {
    console.error('Error checking table:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      details: error.detail
    });
  }
});

// Database health check
app.get('/api/health', async (req, res) => {
  try {
    console.log('Health check requested');
    console.log('Database connection string:', process.env.DATABASE_URL || 'Using fallback connection string');
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('Health check successful:', result.rows[0]);
    
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].current_time,
      connectionString: process.env.DATABASE_URL ? 'Using environment variable' : 'Using fallback'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message,
      code: error.code,
      details: error.detail
    });
  }
});

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    console.log('Fetching posts with query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    console.log('Query parameters:', { page, limit, offset });

    const postsQuery = `
      SELECT * FROM mboard 
      ORDER BY idx DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) as total FROM mboard';
    
    console.log('Executing posts query with params:', [limit, offset]);
    const postsResult = await pool.query(postsQuery, [limit, offset]);
    console.log('Posts query result:', postsResult.rows);
    
    console.log('Executing count query');
    const countResult = await pool.query(countQuery);
    console.log('Count query result:', countResult.rows[0]);

    const response = {
      posts: postsResult.rows,
      total: parseInt(countResult.rows[0].total),
      currentPage: page,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching posts:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update hit count
    await pool.query('UPDATE mboard SET hit = hit + 1 WHERE idx = $1', [id]);
    
    // Get post details
    const result = await pool.query('SELECT * FROM mboard WHERE idx = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    console.log('Creating post with data:', req.body);
    console.log('File:', req.file);
    
    const { subject, name, password, content } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const imglist = req.file ? req.file.filename : '';
    
    console.log('Processed data:', { subject, name, content, imglist, ip });
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    const query = `
      INSERT INTO mboard (subject, name, password, content, hit, imglist, ip)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    console.log('Executing query with params:', [subject, name, '***', content, 0, imglist, ip]);
    
    const result = await pool.query(query, [
      subject, name, hashedPassword, content, 0, imglist, ip
    ]);
    
    console.log('Query executed successfully, result:', result.rows[0]);
    
    res.status(201).json({
      message: 'Post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, password } = req.body;
    
    // Verify password
    const postResult = await pool.query('SELECT password FROM mboard WHERE idx = $1', [id]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isValidPassword = await bcrypt.compare(password, postResult.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const query = `
      UPDATE mboard 
      SET subject = $1, content = $2, rdate = CURRENT_TIMESTAMP
      WHERE idx = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [subject, content, id]);
    
    res.json({
      message: 'Post updated successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    // Verify password
    const postResult = await pool.query('SELECT password FROM mboard WHERE idx = $1', [id]);
    
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isValidPassword = await bcrypt.compare(password, postResult.rows[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    await pool.query('DELETE FROM mboard WHERE idx = $1', [id]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app; 