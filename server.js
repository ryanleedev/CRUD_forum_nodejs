const express = require('express');
const fetch = require('node-fetch');
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

// Supabase configuration
const SUPABASE_URL = 'https://zmgovmbmgaxscjevxzhk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZ292bWJtZ2F4c2NqZXZ4emhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1Nzg3NDQsImV4cCI6MjA2OTE1NDc0NH0.UiZNo18w_CFk0lqf7Ek7gEYZ76z2rKPGBIIpXPpw6ks';

// Supabase API helper functions
async function supabaseRequest(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Supabase API error:', error);
    throw error;
  }
}

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

// Database health check
app.get('/api/health', async (req, res) => {
  try {
    console.log('Health check requested');
    const result = await supabaseRequest('mboard?select=count');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString(),
      connectionString: 'Using Supabase REST API'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message
    });
  }
});

// Database table check
app.get('/api/check-table', async (req, res) => {
  try {
    console.log('Checking mboard table...');
    const result = await supabaseRequest('mboard?select=*&limit=1');
    
    res.json({
      tableExists: true,
      rowCount: result.length,
      sampleData: result[0] || null
    });
  } catch (error) {
    console.error('Error checking table:', error);
    res.status(500).json({ 
      error: error.message
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

    // Get all posts first (Supabase doesn't support OFFSET in REST API easily)
    const allPosts = await supabaseRequest('mboard?select=*&order=idx.desc');
    
    // Manual pagination
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const posts = allPosts.slice(startIndex, endIndex);
    
    const response = {
      posts: posts,
      total: allPosts.length,
      currentPage: page,
      totalPages: Math.ceil(allPosts.length / limit)
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching post with id:', id);
    
    const result = await supabaseRequest(`mboard?select=*&idx=eq.${id}`);
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = result[0];
    
    // Update hit count
    await supabaseRequest(`mboard?idx=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ hit: post.hit + 1 })
    });
    
    res.json(post);
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
    
    const postData = {
      subject,
      name,
      password: hashedPassword,
      content,
      hit: 0,
      imglist,
      ip,
      rdate: new Date().toISOString()
    };
    
    console.log('Sending post data:', { ...postData, password: '***' });
    
    const result = await supabaseRequest('mboard', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
    
    console.log('Post created successfully:', result);
    
    res.status(201).json({
      message: 'Post created successfully',
      post: result[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
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
    
    console.log('Updating post:', { id, subject, content });
    
    // Get current post to verify password
    const currentPost = await supabaseRequest(`mboard?select=password&idx=eq.${id}`);
    
    if (currentPost.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isValidPassword = await bcrypt.compare(password, currentPost[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const updateData = {
      subject,
      content,
      rdate: new Date().toISOString()
    };
    
    const result = await supabaseRequest(`mboard?idx=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    
    res.json({
      message: 'Post updated successfully',
      post: result[0]
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
    
    console.log('Deleting post:', { id });
    
    // Get current post to verify password
    const currentPost = await supabaseRequest(`mboard?select=password&idx=eq.${id}`);
    
    if (currentPost.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isValidPassword = await bcrypt.compare(password, currentPost[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    await supabaseRequest(`mboard?idx=eq.${id}`, {
      method: 'DELETE'
    });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using Supabase REST API for database operations');
});

module.exports = app; 