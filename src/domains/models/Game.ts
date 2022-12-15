/* eslint-disable no-underscore-dangle */
import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IChat {
  username: string;
  chat: string;
  createdAt: Date;
}

export interface IGame extends IBase {
  game: string;
  presentationId: Types.ObjectId;
  chat: IChat[];
  ended: boolean;
  createdAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    game: { type: String, required: true },
    presentationId: { type: Schema.Types.ObjectId, required: true },
    chat: { type: Schema.Types.Mixed, required: false },
    ended: { type: Boolean, required: true }
  },
  {
    timestamps: true
  }
);

export class GameModel extends BaseModel {
  schema = gameSchema;

  modelName = ModelName.GameModel;
}
