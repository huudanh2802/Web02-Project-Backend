import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IAnswer {
  id: string;
  answer: string;
}
export interface ISlide {
  question: string;
  correct: string;
  answers: IAnswer[];
}

export interface IQuestion {
  user: string;
  question: string;
  createdAt: Date;
  upvote: number;
  answer: string;
  checkAnswer: boolean;
}
export interface IPresentation extends IBase {
  name: string;
  groupId: Types.ObjectId;
  slides: ISlide[];
  createdAt: Date;
  questionList?: IQuestion[];
}

const presentationSchema = new Schema<IPresentation>(
  {
    name: { type: String, required: true },
    groupId: { type: Schema.Types.ObjectId, required: true },
    slides: { type: Schema.Types.Mixed, required: true },
    questionList: { type: Schema.Types.Mixed, required: false }
  },
  {
    timestamps: true
  }
);

export class PresentationModel extends BaseModel {
  schema = presentationSchema;

  modelName = ModelName.PresentationModel;
}
