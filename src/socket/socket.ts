import { Express } from "express";
import EnvVars from "@src/declarations/major/EnvVars";
import http from "http";
import { Server } from "socket.io";
import leaveGame from "@src/socket/utils/leavegame";

import { User, Game } from "@src/socket/declarations/interface";

const socketServer = (app: Express) => {
  // Realtime
  const server = http.createServer(app);

  let games: Game[] = [];
  let allUsers: User[] = [];

  const io = new Server(server, {
    cors: {
      origin: EnvVars.clientHost,
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log(`--[SOCKET/CONNECT] User connected ${socket.id}\n`);

    // Game handling
    socket.on("create_game", (data: { game: string; presentation: string }) => {
      const { game, presentation } = data;
      socket.join(game);

      // Add the new game to list
      games.push({ game, presentation, users: [] });
      console.log(`--[SOCKET/GAME]\n${JSON.stringify(games)}\n`);

      console.log(`--[SOCKET/CREATE] Game ${game} has been initiated\n`);
    });

    socket.on("start_game", (data: { game: string }) => {
      const { game } = data;

      socket.to(game).emit("start_game");

      console.log(`--[SOCKET/CREATE] Game ${game} has started\n`);
    });

    socket.on("end_game", (data: { game: string }) => {
      const { game } = data;
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        games = games.filter((g: Game) => g.game !== game);
        socket.to(targetGame.game).emit("end_game");
        console.log(`--[SOCKET/END] Host has ended game ${targetGame.game}\n`);
      }

      socket.leave(game);
      console.log(`--[SOCKET/END]\n${JSON.stringify(games)}\n`);
    });

    // Add user to game
    socket.on("join_game", (data: { username: string; game: string }) => {
      const { username, game } = data;
      socket.join(game);

      // Save new user to game
      const targetGame = games.find((g) => g.game === game);
      let success = true;
      if (targetGame) {
        targetGame.users.push({ id: socket.id, username, game });
        allUsers.push({ id: socket.id, username, game });
        const targetGameUsers = allUsers.filter((user) => user.game === game);
        socket.to(game).emit(`${game}_users`, { users: targetGameUsers });
        socket.emit(`${game}_users`, { users: targetGameUsers });

        socket.emit("join_game_result", {
          success,
          game: targetGame.game,
          presentation: targetGame.presentation
        });
        console.log(`--[SOCKET/JOIN] ${username} has joined the game\n`);
        console.log(
          `--[SOCKET/JOIN] Game ${targetGame.game}\n${JSON.stringify(
            allUsers
          )}\n`
        );
        console.log(`--[SOCKET/JOIN] All Users\n${JSON.stringify(allUsers)}\n`);
      } else {
        success = false;
        socket.emit("join_game_result", { success, game });
        socket.leave(game);
        console.log(
          `--[SOCKET/JOIN] ${username} tried to join non-existent game ${game}\n`
        );
      }
    });

    // User leaves game
    socket.on("leave_game", (data) => {
      const { username, game } = data;
      socket.leave(game);
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        targetGame.users = leaveGame(socket.id, targetGame.users);
        socket
          .to(targetGame.game)
          .emit(`${game}_users`, { users: targetGame.users });
        console.log(
          `--[SOCKET/LEAVE] ${username} has left game ${targetGame.game}\n`
        );
        console.log(
          `--[SOCKET/LEAVE] Game ${targetGame.game}\n${JSON.stringify(
            targetGame.users
          )}\n`
        );
      }
      allUsers = leaveGame(socket.id, allUsers);
      console.log(`--[SOCKET/LEAVE] All Users\n${JSON.stringify(allUsers)}\n`);
    });

    // User disconnects
    socket.on("disconnect", () => {
      const user = allUsers.find((u) => u.id === socket.id);
      if (user?.username) {
        const targetGame = games.find((g) => g.game === user.game);
        if (targetGame) {
          targetGame.users = leaveGame(socket.id, targetGame.users);
          socket
            .to(targetGame.game)
            .emit(`${targetGame.game}_users`, { users: targetGame.users });
          console.log(
            `--[SOCKET/DISCON] ${user.username} has disconnected from game ${targetGame.game}\n`
          );
          console.log(
            `--[SOCKET/DISCON] Game ${targetGame.game}\n${JSON.stringify(
              targetGame.users
            )}\n`
          );
        }
        allUsers = leaveGame(socket.id, allUsers);
        console.log(
          `--[SOCKET/DISCON] All Users\n${JSON.stringify(allUsers)}\n`
        );
      } else {
        console.log(`--[SOCKET/DISCON] User ${socket.id} has disconnected\n`);
      }
    });
  });

  return server;
};

export default socketServer;
