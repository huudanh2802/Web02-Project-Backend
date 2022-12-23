import { IGame, GameModel } from "@src/domains/models/Game";
import { Types } from "mongoose";
import { injectable } from "tsyringe";
import BaseRepository from "./BaseRepository";

@injectable()
export default class GameRepository extends BaseRepository<GameModel, IGame> {
  constructor() {
    const gameModel = new GameModel();
    super(gameModel);
  }

  async getByPresentation(presentationId: Types.ObjectId) {
    const result = await this.set.find({ presentationId });
    return result;
  }

  async getByGame(game: string) {
    const result = await this.set.findOne({
      game,
      ended: false
    });
    return result;
  }

  async qResultExist(game: string, question: number) {
    const exist = await this.set.findOne({
      game,
      "result.question": question
    });
    console.log(exist);
    return exist !== null;
  }
}
