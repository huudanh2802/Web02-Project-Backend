import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IAnswer {
  id: string;
  answer: string;
}
export type ISlide = {
  // 1: MutipleChoice
  // 2: Heading
  // 3: Paragraph
  type: number;
};

export type IMutipleChoice = ISlide & {
  type: 1;
  question: string;
  correct: string;
  answers: IAnswer[];
};

export type IHeading = ISlide & {
  type: 2;
  heading: string;
};

export type IParagraph = ISlide & {
  type: 3;
  heading: string;
  paragraph: string;
};
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
  creator: Types.ObjectId;
  collabs?: Types.ObjectId[];
  slides: ISlide[];
  createdAt: Date;
  questionList?: IQuestion[];
}

const presentationSchema = new Schema<IPresentation>(
  {
    name: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, required: true },
    collabs: { type: [Schema.Types.ObjectId], required: false },
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
