# CRUD Forum - Node.js Version

A modern CRUD forum application built with Node.js, Express, and Supabase PostgreSQL database.

## Features

- **Create Posts**: Write new forum posts with author, subject, content, and optional images
- **Read Posts**: View all posts with pagination and individual post details
- **Update Posts**: Edit existing posts with password verification
- **Delete Posts**: Remove posts with password verification
- **Image Upload**: Support for image attachments
- **Responsive Design**: Modern UI with Bootstrap 5
- **Password Protection**: Secure password hashing with bcrypt

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **File Upload**: Multer
- **Password Hashing**: bcrypt
- **Deployment**: Vercel

## Database Schema

```sql
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
```

## API Endpoints

- `GET /api/posts` - Get all posts with pagination
- `GET /api/posts/:id` - Get specific post by ID
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update existing post
- `DELETE /api/posts/:id` - Delete post

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create .env file):
   ```
   DATABASE_URL=postgresql://postgres:rleeforum2025@db.zmgovmbmgaxscjevxzhk.supabase.co:5432/postgres
   PORT=3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000 in your browser

## Deployment

This application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Node.js configuration
3. Set the environment variable `DATABASE_URL` in Vercel dashboard
4. Deploy!

## Project Structure

```
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── vercel.json        # Vercel deployment config
├── public/            # Static files
│   ├── index.html     # Main page
│   ├── create.html    # Create post page
│   ├── read.html      # Read post page
│   ├── main.css       # Styles
│   ├── main.js        # Main page JavaScript
│   ├── create.js      # Create page JavaScript
│   ├── read.js        # Read page JavaScript
│   └── uploads/       # Uploaded images
└── README.md          # This file
```

## Security Features

- Password hashing with bcrypt
- Input validation
- SQL injection prevention with parameterized queries
- CORS configuration
- File upload restrictions

## License

MIT License 