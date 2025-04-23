# Bible Tracker

A modern web application to help you track your daily Bible reading and devotional journey.

![Bible Tracker Screenshot](client/public/logo512.png)

## Features

- **Daily Devotionals**: Create and manage daily devotionals with Bible references
- **Bible Reading**: View Bible passages directly in the app
- **Personal Notes**: Add your thoughts and reflections to each devotional
- **Calendar View**: Track your reading progress with a visual calendar
- **Leaderboard**: See how you compare with other users
- **User Authentication**: Secure login and registration

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion for animations
- Axios for API requests

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/acsahl/BibleTracker.git
   cd BibleTracker
   ```

2. Install dependencies for both client and server
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables
   - Copy the example files to create your own environment files:
     ```
     # For server
     cp server/.env.example server/.env
     
     # For client
     cp client/.env.development.example client/.env.development
     cp client/.env.production.example client/.env.production
     ```
   - Edit these files with your actual values

4. Start the development servers
   ```
   # Start the backend server (from the server directory)
   npm run dev
   
   # Start the frontend (from the client directory)
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Server (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5001)
- `BIBLE_API_KEY`: API key for the Bible API

### Client (.env.development or .env.production)
- `REACT_APP_API_URL`: URL of the backend API
- `REACT_APP_BIBLE_API_KEY`: API key for the Bible API

## Deployment

The application is configured for deployment on platforms like Render, Vercel, or Netlify.

### Backend Deployment
1. Set up a MongoDB database (Atlas recommended)
2. Configure environment variables on your hosting platform
3. Deploy the server code

### Frontend Deployment
1. Build the React application: `npm run build`
2. Configure environment variables on your hosting platform
3. Deploy the build folder

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bible API provided by [scripture.api.bible](https://scripture.api.bible/)
- Icons from [Heroicons](https://heroicons.com/)
- UI components inspired by modern design principles 