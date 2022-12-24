import { Express } from "express";
import EnvVars from "@src/declarations/major/EnvVars";
import http from "http";
import GroupService from "@src/services/GroupService";
import GroupRepository from "@src/repos/GroupRepository";
import UserRepository from "@src/repos/UserRepository";
import GameService from "@src/services/GameService";
import GameRepository from "@src/repos/GameRepository";
import PresentationRepository from "@src/repos/PresentationRepository";
import { Server } from "socket.io";
import { leaveGame, leaveGameCoHost } from "@src/socket/utils/leavegame";
import { Types } from "mongoose";

import { User, Game, Group } from "@src/socket/declarations/interface";
import { MutipleChoiceDTO, Slide } from "@src/domains/dtos/PresentationDTO";

const socketServer = (app: Express) => {
  // Realtime
  const server = http.createServer(app);

  let games: Game[] = [];
  let allUsers: User[] = [];
  let allCoHosts: User[] = [];
  let groups: Group[] = [];

  const gameRepository: GameRepository = new GameRepository();
  const presentationRepository: PresentationRepository =
    new PresentationRepository();
  const gameService: GameService = new GameService(
    gameRepository,
    presentationRepository
  );
  const groupRepository: GroupRepository = new GroupRepository();
  const userRepository: UserRepository = new UserRepository();
  const groupService: GroupService = new GroupService(
    groupRepository,
    userRepository
  );

  const io = new Server(server, {
    cors: {
      origin: EnvVars.clientHost,
      methods: ["GET", "POST"]
    }
  });
  io.on("connection", (socket) => {
    console.log(`--[SOCKET/CONNECT] User connected ${socket.id}\n`);

    // Group rooms handling #########################################
    socket.on("join_all_room", async (data: { userId: Types.ObjectId }) => {
      const { userId } = data;
      const ownGroup = await groupService.getOwnGroup(userId);
      const memberGroup = await groupService.getMemberGroup(userId);
      const ownGroupId: Group[] = ownGroup.map((g) => ({
        id: g.id,
        name: g.name,
        createdAt: g.createdAt
      }));
      const memberGroupId: Group[] = memberGroup.map((g) => ({
        id: g.id,
        name: g.name,
        createdAt: g.createdAt
      }));

      groups = [...ownGroupId, ...memberGroupId];
      groups.forEach((group) => {
        socket.join(group.id);
      });
    });

    // Game state handling ##########################################
    socket.on(
      "create_game",
      async (data: {
        game: string;
        presentation: string;
        group: string | null;
      }) => {
        const { game, presentation, group } = data;
        socket.join(game);

        // Add the new game to list
        if (group) {
          const targetGame = games.find((g) => g.group === group);
          if (targetGame) {
            games = games.filter((g) => g.game !== targetGame.game);
            socket.to(targetGame.game).emit("disrupt_game");
            gameService.endGame(targetGame.game);
            console.log(
              `--[SOCKET/DISRUPT] Group ${group}: Game ${targetGame.game} is replaced with Game ${game}\n`
            );
          }
          const targetGroup = groups.find((g) => g.id === group);
          if (targetGroup) {
            socket
              .to(targetGroup.id)
              .emit("alert_group_present", { groupName: targetGroup.name });
            console.log(
              `--[SOCKET/CREATE] Group ${targetGroup.id}: Game ${game} is presented in group ${group}\n`
            );

            // For those who are already in the group, show the presentation card
            const curGame = await gameService.getCurrentPresentation(
              new Types.ObjectId(targetGroup.id)
            );
            socket.to(targetGroup.id).emit("show_group_present", {
              game: curGame.game.game,
              presentation: curGame.presentation
            });
          }
        }
        games.push({
          game,
          presentation,
          users: [],
          cohosts: [],
          group,
          slide: -1,
          answer: [
            { id: "A", count: 0 },
            { id: "B", count: 0 },
            { id: "C", count: 0 },
            { id: "D", count: 0 }
          ],
          showAnswer: false
        });
        console.log(`--[SOCKET/GAME]\n${JSON.stringify(games)}\n`);

        console.log(`--[SOCKET/CREATE] Game ${game} has been initiated\n`);
      }
    );

    socket.on("start_game", (data: { game: string }) => {
      const { game } = data;

      socket.to(game).emit("start_game");
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        targetGame.slide = 0;
        console.log(`--[SOCKET/CREATE] Game ${game} has started\n`);
      } else {
        console.log(
          `--[SOCKET/CREATE] Can't start non-existent game ${game}\n`
        );
      }
    });

    socket.on(
      "end_game",
      (data: { game: string; groupId: string | undefined }) => {
        const { game, groupId } = data;
        const targetGame = games.find((g) => g.game === game);
        if (targetGame) {
          games = games.filter((g: Game) => g.game !== game);
          socket.to(targetGame.game).emit("end_game");
          gameService.endGame(game);
          console.log(
            `--[SOCKET/END] Host has ended game ${targetGame.game}\n`
          );

          // Hide current game in the group
          if (groupId) {
            socket.to(groupId).emit("hide_group_present");
          }
        }

        socket.leave(game);
        console.log(`--[SOCKET/END]\n${JSON.stringify(games)}\n`);
      }
    );

    socket.on(
      "finish_game",
      (data: { game: string; groupId: string | undefined }) => {
        const { game, groupId } = data;
        const targetGame = games.find((g) => g.game === game);
        if (targetGame) {
          games = games.filter((g: Game) => g.game !== game);
          socket.to(targetGame.game).emit("finish_game");
          gameService.endGame(game);
          console.log(`--[SOCKET/FINISH] Game ${targetGame.game} ended\n`);

          // Hide current game in the group
          if (groupId) {
            socket.to(groupId).emit("hide_group_present");
          }
        }

        socket.leave(game);
        console.log(`--[SOCKET/FINISH]\n${JSON.stringify(games)}\n`);
      }
    );

    // User handling ################################################
    socket.on(
      "join_game",
      (data: { username: string; game: string; groupId: string }) => {
        const { username, game, groupId } = data;
        socket.join(game);

        // Save new user to game
        const targetGame = games.find((g) => g.game === game);
        let success = true;
        if (targetGame && targetGame.group === groupId) {
          targetGame.users.push({ id: socket.id, username, game });
          allUsers.push({ id: socket.id, username, game });
          const targetGameUsers = allUsers.filter((user) => user.game === game);
          socket.to(game).emit(`${game}_users`, { users: targetGameUsers });
          socket.emit(`${game}_users`, { users: targetGameUsers });

          socket.emit("join_game_result", {
            success,
            game: targetGame.game,
            presentation: targetGame.presentation,
            slide: targetGame.slide
          });

          console.log(`--[SOCKET/JOIN] ${username} has joined the game\n`);
          console.log(
            `--[SOCKET/JOIN] Game ${targetGame.game}\n${JSON.stringify(
              allUsers
            )}\n`
          );
          console.log(
            `--[SOCKET/JOIN] All Users\n${JSON.stringify(allUsers)}\n`
          );
        } else {
          let isPrivate = false;
          success = false;
          if (targetGame && targetGame.group !== groupId) {
            isPrivate = true;
            console.log(
              `--[SOCKET/JOIN] ${username} tried to join private game ${game}\n`
            );
          } else {
            console.log(
              `--[SOCKET/JOIN] ${username} tried to join non-existent game ${game}\n`
            );
          }
          socket.emit("join_game_result", { success, game, isPrivate });
          socket.leave(game);
        }
      }
    );

    socket.on("request_current_slide", (data: { game: string }) => {
      const targetGame = games.find((g) => g.game === data.game);
      if (targetGame) {
        console.log(`${JSON.stringify(targetGame)}\n`);
        socket.emit("result_current_slide", {
          slide: targetGame.slide,
          answer: targetGame.answer,
          showAnswer: targetGame.showAnswer
        });
      }
    });

    socket.on("join_host_game", (data: { username: string; game: string }) => {
      const { username, game } = data;
      socket.join(game);

      // Save new user to game
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        targetGame.cohosts.push({ id: socket.id, username, game });
        allCoHosts.push({ id: socket.id, username, game });
        const targetGameCoHosts = allCoHosts.filter(
          (user) => user.game === game
        );
        socket.to(game).emit(`${game}_cohosts`, { cohosts: targetGameCoHosts });
        socket.emit(`${game}_cohosts`, { cohosts: targetGameCoHosts });
        console.log(targetGame);
        socket.emit("join_host_game_result", {
          game: targetGame.game,
          presentation: targetGame.presentation,
          slide: targetGame.slide
        });
        console.log(
          `--[SOCKET/JOIN] All Co-Hosts\n${JSON.stringify(allCoHosts)}\n`
        );
        console.log(
          `--[SOCKET/JOIN] ${username} has joined to co-host the game ${targetGame}\n`
        );
      } else {
        socket.leave(game);
      }
    });

    socket.on("leave_game", (data) => {
      const { username, game } = data;
      socket.leave(game);
      if (username) {
        const targetGame = games.find((g) => g.game === game);
        if (targetGame) {
          targetGame.users = leaveGame(socket.id, targetGame.users);
          targetGame.cohosts = leaveGameCoHost(socket.id, targetGame.cohosts);
          socket
            .to(targetGame.game)
            .emit(`${game}_users`, { users: targetGame.users });
          socket
            .to(targetGame.game)
            .emit(`${game}_cohosts`, { cohosts: targetGame.cohosts });
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
        allCoHosts = leaveGameCoHost(socket.id, allCoHosts);
        console.log(
          `--[SOCKET/LEAVE] All Users\n${JSON.stringify(allUsers)}\n`
        );
        console.log(
          `--[SOCKET/LEAVE] All Co-Hosts\n${JSON.stringify(allCoHosts)}\n`
        );
      }
    });

    socket.on("disconnect", () => {
      const user = allUsers.find((u) => u.id === socket.id);
      if (user?.username) {
        const targetGame = games.find((g) => g.game === user.game);
        if (targetGame) {
          targetGame.users = leaveGame(socket.id, targetGame.users);
          socket
            .to(targetGame.game)
            .emit(`${targetGame.game}_users`, { users: targetGame.users });
          socket.to(targetGame.game).emit(`${targetGame.game}_cohosts`, {
            cohosts: targetGame.cohosts
          });
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
        allCoHosts = leaveGameCoHost(socket.id, allCoHosts);
        console.log(
          `--[SOCKET/DISCON] All Users\n${JSON.stringify(allUsers)}\n`
        );
        console.log(
          `--[SOCKET/DISCON] All Co-Hosts\n${JSON.stringify(allCoHosts)}\n`
        );
      } else {
        console.log(`--[SOCKET/DISCON] User ${socket.id} has disconnected\n`);
      }
    });

    // In-game handling #############################################
    socket.on(
      "submit_answer",
      (data: {
        question: number;
        username: string;
        id: string;
        correct: boolean;
        game: string;
      }) => {
        const { question, username, id, correct, game } = data;
        const targetGame = games.find((g) => g.game === game);
        const createdAt = new Date();
        gameService.handleChoiceResult(game, question, {
          username,
          answer: id,
          correct,
          createdAt
        });
        if (targetGame) {
          const answerIdx = targetGame.answer.findIndex((a) => a.id === id);
          targetGame.answer[answerIdx].count += 1;
          socket
            .to(game)
            .emit("submit_answer", { username, id, correct, createdAt });
          console.log(
            `--[SOCKET/SUBMIT] ${socket.id}'s answer for Question ${
              question + 1
            } is ${id}\n`
          );
        }
      }
    );

    socket.on("show_answer", (data: { game: string; slide: Slide }) => {
      const { game, slide } = data;
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        targetGame.showAnswer = true;
        socket.to(game).emit("show_answer");
        const mutipleChoice = slide as MutipleChoiceDTO;
        console.log(
          `--[SOCKET/SHOW] Correct answer for Question ${slide.idx + 1} is ${
            mutipleChoice.correct
          }\n`
        );
      }
    });

    socket.on("next_question", (data: { game: string; slide: Slide }) => {
      const { game, slide } = data;
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        targetGame.answer = [
          { id: "A", count: 0 },
          { id: "B", count: 0 },
          { id: "C", count: 0 },
          { id: "D", count: 0 }
        ];
        targetGame.showAnswer = false;
        targetGame.slide += 1;
        socket.to(game).emit("next_question");
        console.log(`--[SOCKET/NEXT] Continued to Question ${slide.idx + 1}\n`);
      }
    });

    // Chat & Question handling #####################################
    socket.on(
      "send_chat_msg",
      (data: {
        username: string;
        chat: string;
        date: Date;
        role: number;
        game: string;
      }) => {
        const { username, chat, date, role, game } = data;
        const targetGame = games.find((g) => g.game === game);
        if (targetGame) {
          socket
            .to(game)
            .emit("receive_chat_msg", { username, chat, role, date });
          gameService.newChat(game, {
            username,
            chat,
            role,
            createdAt: date
          });
          console.log(`--[SOCKET/CHAT/${game}] ${username}: ${chat}\n`);
        }
      }
    );

    socket.on(
      "send_question_msg",
      (data: {
        idx: number;
        username: string;
        question: string;
        date: Date;
        role: number;
        game: string;
      }) => {
        const { idx, username, question, date, role, game } = data;
        const targetGame = games.find((g) => g.game === game);
        if (targetGame) {
          socket.to(game).emit("receive_question_msg", {
            idx,
            username,
            question,
            role,
            date
          });
          gameService.newQuestion(game, {
            idx,
            username,
            question,
            role,
            answered: false,
            vote: 0,
            createdAt: date
          });
          console.log(
            `--[SOCKET/QUESTION/${game}] Q.${idx}-${username}: ${question}\n`
          );
        }
      }
    );

    socket.on("send_vote", (data: { idx: number; game: string }) => {
      const { idx, game } = data;
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        socket.to(game).emit("receive_vote", { idx });
        gameService.voteQuestion(game, idx, true);
        console.log(`--[SOCKET/QUESTION/${game}] Q.${idx} received 1 upvote\n`);
      }
    });

    socket.on("send_unvote", (data: { idx: number; game: string }) => {
      const { idx, game } = data;
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        socket.to(game).emit("receive_unvote", { idx });
        gameService.voteQuestion(game, idx, false);
        console.log(`--[SOCKET/QUESTION/${game}] Q.${idx} got 1 less vote\n`);
      }
    });

    socket.on("send_answered", (data: { idx: number; game: string }) => {
      const { idx, game } = data;
      const targetGame = games.find((g) => g.game === game);
      if (targetGame) {
        socket.to(game).emit("receive_answered", { idx });
        gameService.answeredQuestion(game, idx);
        console.log(
          `--[SOCKET/QUESTION/${game}] Q.${idx} is marked as answered\n`
        );
      }
    });
  });

  return server;
};

export default socketServer;
