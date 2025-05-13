
![Screenshot (22)](https://github.com/user-attachments/assets/97121a7f-593f-4c54-a2c0-270e7c5bc2e6)
![Screenshot (23)](https://github.com/user-attachments/assets/108dac01-5a65-40c2-9cb6-a5ed45aaa0df)


# Real-Time Collaborative Code Editor

This is a real-time collaborative code editor built using React, Node.js, WebSockets, Redis, and TypeScript. The platform allows multiple users to join a shared room and collaboratively edit code in real time.

## Features

- Real-time code collaboration
- WebSocket-based communication
- Redis for messaging and synchronization
- Clustered worker support for performance
- Multiple rooms with unique IDs
- Lightweight frontend with Vite

## Technologies Used

- React.js
- Node.js
- WebSockets (Socket.IO or native WebSocket)
- Redis
- TypeScript
- Express
- Vite
- Docker (for Redis container)

## Project Structure



apps/
│
├── express-server/        # Backend Express server for API and Redis Pub/Sub
├── websocket-server/      # WebSocket server for real-time communication
├── worker/                # Clustered worker setup
└── frontend/              # React frontend with Vite

```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- Redis (can be run via Docker)
- Git

### Installation

1. Clone the repository:

2. Install dependencies:



npm install



3. Start Redis (use Docker or install locally)

```

docker-compose up -d

```

4. Start the development servers

```

npm run dev

```

5. Open the app in your browser

[http://localhost:5173](http://localhost:5173)




