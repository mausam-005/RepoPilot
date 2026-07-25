const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Bookmark = require('./models/Bookmark');
const User = require('./models/User');
const axios = require('axios');

let io;

// In-memory store of the last seen event ID per repository
// To prevent spamming the user with old events on every poll
const lastSeenEvents = {}; 

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Join a room specific to this user so we can emit personal events to them
    socket.join(`user_${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  // Start the background poller to simulate webhooks
  startBackgroundPoller();
};

const startBackgroundPoller = () => {
  // Poll every 30 seconds
  setInterval(async () => {
    try {
      // 1. Get all currently connected users (rooms that start with 'user_')
      const rooms = io.sockets.adapter.rooms;
      const activeUserIds = [];
      for (const [roomName, _] of rooms.entries()) {
        if (roomName.startsWith('user_')) {
          activeUserIds.push(roomName.replace('user_', ''));
        }
      }

      if (activeUserIds.length === 0) return; // Nobody is online, don't waste rate limits

      // 2. Process each active user
      for (const userId of activeUserIds) {
        const user = await User.findById(userId);
        if (!user || !user.githubToken) continue;

        // Get user's bookmarks
        const bookmarks = await Bookmark.find({ userId: user._id });
        if (bookmarks.length === 0) continue;

        // To save rate limits, we only poll the top 3 bookmarked repos for this simulated webhook
        const reposToPoll = bookmarks.slice(0, 3);

        for (const repo of reposToPoll) {
          try {
            const { data: events } = await axios.get(`https://api.github.com/repos/${repo.repoFullName}/events`, {
              headers: {
                'Authorization': `token ${user.githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'RepoPilot-App'
              },
              params: { per_page: 5 }
            });

            if (events && events.length > 0) {
              const latestEvent = events[0];
              
              // Have we seen this event before for this repo?
              if (lastSeenEvents[repo.repoFullName] !== latestEvent.id) {
                lastSeenEvents[repo.repoFullName] = latestEvent.id;
                
                // We have a NEW event! Broadcast it to the user's room
                io.to(`user_${userId}`).emit('github_event', {
                  repo: repo.repoFullName,
                  type: latestEvent.type,
                  actor: latestEvent.actor.login,
                  actorAvatar: latestEvent.actor.avatar_url,
                  createdAt: latestEvent.created_at,
                  payload: latestEvent.payload
                });
              }
            }
          } catch (err) {
            // Ignore rate limit or fetch errors silently for the poller
            if (err.response?.status !== 404 && err.response?.status !== 403) {
              console.error(`Poller error for ${repo.repoFullName}:`, err.message);
            }
          }
        }
      }

    } catch (error) {
      console.error('Background Poller Error:', error);
    }
  }, 30000); // 30 seconds
};

module.exports = { initSocket };
