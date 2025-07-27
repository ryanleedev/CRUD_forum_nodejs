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
app.use(express.static('public'));

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:rleeforum2025@db.zmgovmbmgaxscjevxzhk.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
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
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS mboard (
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
    console.log('Database table initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
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

// API Routes
app.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const postsQuery = `
      SELECT * FROM mboard 
      ORDER BY idx DESC 
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) as total FROM mboard';
    
    const [postsResult, countResult] = await Promise.all([
      pool.query(postsQuery, [limit, offset]),
      pool.query(countQuery)
    ]);

    res.json({
      posts: postsResult.rows,
      total: parseInt(countResult.rows[0].total),
      currentPage: page,
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    const { subject, name, password, content } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const imglist = req.file ? req.file.filename : '';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO mboard (subject, name, password, content, hit, imglist, ip)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      subject, name, hashedPassword, content, 0, imglist, ip
    ]);
    
    res.status(201).json({
      message: 'Post created successfully',
      post: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app; 