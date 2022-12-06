import { Express } from "express";
import EnvVars from "@src/declarations/major/EnvVars";
import http from "http";
import { Server } from "socket.io";
import leaveRoom from "@src/socket/utils/leaveroom";

const socketServer = (app: Express) => {
  // Realtime
  const server = http.createServer(app);

  let targetGame = "";
  let allUsers: any[] = [];

  const io = new Server(server, {
    cors: {
      origin: EnvVars.clientHost,
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);

    // Add user to game
    socket.on("join_game", (data) => {
      const { username, game } = data;
      socket.join(game);

      // Send message to all users
      socket.to(game).emit("receive_message", {
        message: `${username} has joined the game`,
        username: "BOT"
      });

      // Send message to new user
      socket.emit("receive_message", {
        message: `Welcome ${username}`,
        username: "BOT"
      });

      // Save new user to game
      targetGame = game;
      allUsers.push({ id: socket.id, username, game });
      const targetGameUsers = allUsers.filter((user) => user.game === game);
      socket.to(game).emit("targetGame_users", targetGameUsers);
      socket.emit("targetGame_users", targetGameUsers);

      console.log(`${username} has joined the game`);
      console.log(`allUsers: ${JSON.stringify(allUsers)}`);
    });

    // User leaves room
    socket.on("leave_game", (data) => {
      const { username, game } = data;
      socket.leave(game);
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(game).emit("targetGame_users", allUsers);
      socket.to(game).emit("receive_message", {
        message: `${username} has left the game`,
        username: "BOT"
      });
      console.log(`${username} has left the game`);
      console.log(`allUsers: ${JSON.stringify(allUsers)}`);
    });

    // User disconnects
    socket.on("disconnect", () => {
      const user = allUsers.find((u) => u.id === socket.id);
      if (user?.username) {
        allUsers = leaveRoom(socket.id, allUsers);
        socket.to(targetGame).emit("targetGame_users", allUsers);
        socket.to(targetGame).emit("receive_message", {
          message: `${user.username} has disconnected.`,
          username: "BOT"
        });
        console.log(`${user.username} has disconnected from game`);
        console.log(`allUsers: ${JSON.stringify(allUsers)}`);
      } else {
        console.log(`User ${socket.id} has disconnected`);
      }
    });
  });

  return server;
};

export default socketServer;
