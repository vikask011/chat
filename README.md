# MERN Chat App

A modern, real-time chatting application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Tailwind CSS. Features include user authentication, real-time messaging, user search, and a beautiful, responsive UI with smooth animations.

## ✨ Features

- **Real-time Chat**: Instant messaging using Socket.io
- **User Authentication**: Secure login/register with JWT tokens
- **User Search**: Find and start conversations with other users
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Beautiful UI**: Modern design with Tailwind CSS and Framer Motion animations
- **Message Management**: Send, receive, and delete messages
- **Online Status**: See who's online and their last seen status
- **Conversation History**: View and search through past conversations

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.io-client** - Real-time client
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mern-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

## 📁 Project Structure

```
mern-chat-app/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── chat/      # Chat-related components
│   │   │   └── ui/        # UI components
│   │   ├── contexts/      # React contexts
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind configuration
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
├── package.json            # Root package.json
└── README.md              # This file
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend client
- `npm run build` - Build the frontend for production
- `npm run install-all` - Install dependencies for all packages

### Server Directory
- `npm run dev` - Start server with nodemon (development)
- `npm start` - Start server in production mode

### Client Directory
- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Messages
- `POST /api/messages` - Send a message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/recent` - Get recent conversations
- `PUT /api/messages/:messageId/read` - Mark message as read
- `DELETE /api/messages/:messageId` - Delete message

### Users
- `GET /api/users/search` - Search users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/online/list` - Get online users
- `PUT /api/users/status` - Update user status

## 🎨 UI Features

- **Light Background**: Clean, modern design with light colors
- **Smooth Animations**: Framer Motion animations for enhanced UX
- **Responsive Layout**: Mobile-first design approach
- **Interactive Elements**: Hover effects, transitions, and micro-interactions
- **Custom Scrollbars**: Styled scrollbars for better aesthetics
- **Loading States**: Beautiful loading spinners and skeleton screens

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation using express-validator
- **CORS Protection**: Configured CORS for security
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a process manager like PM2
3. Set up MongoDB Atlas or production MongoDB instance
4. Configure reverse proxy (Nginx/Apache)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify MongoDB connection
3. Ensure all environment variables are set correctly
4. Check if all dependencies are installed

## 🔮 Future Enhancements

- [ ] File sharing support
- [ ] Group chat functionality
- [ ] Message encryption
- [ ] Push notifications
- [ ] Voice/video calls
- [ ] Message reactions
- [ ] User avatars
- [ ] Dark mode toggle
- [ ] Message search
- [ ] Export chat history

---

**Happy Chatting! 🎉**
