/* eslint-disable no-underscore-dangle */
import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IChat {
  username: string;
  chat: string;
  role: number;
  createdAt: Date;
}

export interface IQuestion {
  idx: number;
  username: string;
  chat: string;
  role: number;
  answered: boolean;
  vote: number;
  createdAt: Date;
}

export interface IGame extends IBase {
  game: string;
  presentationId: Types.ObjectId;
  chat: IChat[];
  question: IQuestion[];
  ended: boolean;
  createdAt: Date;
}

const gameSchema = new Schema<IGame>(
  {
    game: { type: String, required: true },
    presentationId: { type: Schema.Types.ObjectId, required: true },
    chat: { type: Schema.Types.Mixed, required: false },
    question: { type: Schema.Types.Mixed, required: false },
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
