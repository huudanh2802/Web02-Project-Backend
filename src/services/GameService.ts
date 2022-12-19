import PresentationRepository from "@src/repos/PresentationRepository";
import GameRepository from "@src/repos/GameRepository";
import { IGame } from "@src/domains/models/Game";
import { ChatDTO, QuestionDTO } from "@src/domains/dtos/GameDTO";
import { Types } from "mongoose";
import { injectable } from "tsyringe";

@injectable()
export default class GameService {
  gameRepository: GameRepository;

  constructor(gameRepository: GameRepository) {
    this.gameRepository = gameRepository;
  }

  async createNewGame(game: string, presentationId: string) {
    const newGame: IGame = {
      game,
      presentationId: new Types.ObjectId(presentationId),
      chat: [],
      question: [],
      createdAt: new Date(),
      ended: false,
      id: new Types.ObjectId()
    };
    const result = await this.gameRepository.create(newGame);
    return result.id;
  }

  async endGame(game: string) {
    const currentGame = await this.gameRepository.getByGame(game);
    const endedGame: IGame = {
      game: currentGame.game,
      presentationId: new Types.ObjectId(currentGame.presentationId),
      chat: currentGame.chat,
      question: currentGame.question,
      createdAt: currentGame.createdAt,
      ended: true,
      id: currentGame.id
    };
    const result = await this.gameRepository.update(endedGame);
    return result.id;
  }

  async updateChat(game: string, chatDTO: ChatDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldChat = oldGame.chat;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      chat: [...oldChat, chatDTO],
      question: oldGame.question,
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async updateQuestion(game: string, questionDTO: QuestionDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      chat: oldGame.chat,
      question: [...oldQuestion, questionDTO],
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }
}
