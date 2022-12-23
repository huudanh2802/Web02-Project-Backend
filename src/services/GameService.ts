import GameRepository from "@src/repos/GameRepository";
import { IGame } from "@src/domains/models/Game";
import {
  ChatDTO,
  QuestionDTO,
  ResultDTO,
  QResultDTO
} from "@src/domains/dtos/GameDTO";
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
      result: [],
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
      result: currentGame.result,
      chat: currentGame.chat,
      question: currentGame.question,
      createdAt: currentGame.createdAt,
      ended: true,
      id: currentGame.id
    };
    const result = await this.gameRepository.update(endedGame);
    return result.id;
  }

  async newChoiceResult(game: string, question: number, resultDTO: ResultDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldResult = oldGame.result;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      result: [...oldResult, { question, result: [resultDTO] }],
      chat: oldGame.chat,
      question: oldGame.question,
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async updateChoiceResult(
    game: string,
    question: number,
    resultDTO: ResultDTO
  ) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldResult = oldGame.result;
    const qResultIdx = oldResult.findIndex(
      (qResult: QResultDTO) => qResult.question === question
    );
    const oldQResult = oldResult[qResultIdx];
    const qResultDTO = { question, result: [...oldQResult.result, resultDTO] };
    const updatedGame = oldGame;
    updatedGame.result = [
      ...oldResult.slice(0, qResultIdx),
      qResultDTO,
      ...oldResult.slice(qResultIdx + 1)
    ];
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async handleChoiceResult(
    game: string,
    question: number,
    resultDTO: ResultDTO
  ) {
    const qResultExist = await this.gameRepository.qResultExist(game, question);
    if (qResultExist) this.updateChoiceResult(game, question, resultDTO);
    else this.newChoiceResult(game, question, resultDTO);
  }

  async newChat(game: string, chatDTO: ChatDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldChat = oldGame.chat;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      result: oldGame.result,
      chat: [...oldChat, chatDTO],
      question: oldGame.question,
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async newQuestion(game: string, questionDTO: QuestionDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      result: oldGame.result,
      chat: oldGame.chat,
      question: [...oldQuestion, questionDTO],
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async voteQuestion(game: string, idx: number, upvote: boolean) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question; // Question List
    const updatedQuestion = oldQuestion[idx];
    updatedQuestion.vote += upvote ? 1 : -1;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      result: oldGame.result,
      chat: oldGame.chat,
      question: [
        ...oldQuestion.slice(0, idx),
        updatedQuestion,
        ...oldQuestion.slice(idx + 1)
      ],
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async answeredQuestion(game: string, idx: number) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question; // Question List
    const updatedQuestion = oldQuestion[idx];
    updatedQuestion.answered = true;
    const updatedGame: IGame = {
      game: oldGame.game,
      presentationId: new Types.ObjectId(oldGame.presentationId),
      result: oldGame.result,
      chat: oldGame.chat,
      question: [
        ...oldQuestion.slice(0, idx),
        updatedQuestion,
        ...oldQuestion.slice(idx + 1)
      ],
      createdAt: oldGame.createdAt,
      ended: false,
      id: oldGame.id
    };
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }
}
