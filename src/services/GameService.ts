import GameRepository from "@src/repos/GameRepository";
import PresentationRepository from "@src/repos/PresentationRepository";
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

  presentationRepository: PresentationRepository;

  constructor(
    gameRepository: GameRepository,
    presentationRepository: PresentationRepository
  ) {
    this.gameRepository = gameRepository;
    this.presentationRepository = presentationRepository;
  }

  async getCurrentPresentation(groupId: Types.ObjectId) {
    const game = await this.gameRepository.getByGroupId(groupId);
    if (game) {
      const presentation = await this.presentationRepository.get(
        game.presentationId
      );
      return { success: true, game, presentation };
    }
    return { success: false };
  }

  async createNewGame(
    game: string,
    presentationId: string,
    groupId: string | null
  ) {
    const newGame: IGame = {
      game,
      groupId: groupId ? new Types.ObjectId(groupId) : null,
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
    const endedGame = currentGame;
    endedGame.presentationId = new Types.ObjectId(currentGame.presentationId);
    endedGame.ended = true;
    const result = await this.gameRepository.update(endedGame);
    return result.id;
  }

  async newChoiceResult(game: string, question: number, resultDTO: ResultDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldResult = oldGame.result;
    const updatedGame = oldGame;
    updatedGame.result = [...oldResult, { question, result: [resultDTO] }];
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
    const updatedGame = oldGame;
    updatedGame.chat = [...oldChat, chatDTO];
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async newQuestion(game: string, questionDTO: QuestionDTO) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question;
    const updatedGame = oldGame;
    updatedGame.question = [...oldQuestion, questionDTO];
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async voteQuestion(game: string, idx: number, upvote: boolean) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question; // Question List
    const updatedQuestion = oldQuestion[idx];
    updatedQuestion.vote += upvote ? 1 : -1;
    const updatedGame = oldGame;
    updatedGame.question = [
      ...oldQuestion.slice(0, idx),
      updatedQuestion,
      ...oldQuestion.slice(idx + 1)
    ];
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async answeredQuestion(game: string, idx: number) {
    const oldGame = await this.gameRepository.getByGame(game);
    const oldQuestion = oldGame.question; // Question List
    const updatedQuestion = oldQuestion[idx];
    updatedQuestion.answered = true;
    const updatedGame = oldGame;
    updatedGame.question = [
      ...oldQuestion.slice(0, idx),
      updatedQuestion,
      ...oldQuestion.slice(idx + 1)
    ];
    const result = await this.gameRepository.update(updatedGame);
    return result.id;
  }

  async getGameSessions(presentationId: Types.ObjectId) {
    const result = await this.gameRepository.getByPresentation(presentationId);
    return result;
  }
}
