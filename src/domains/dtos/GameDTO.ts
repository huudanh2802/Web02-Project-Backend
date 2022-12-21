import { Types } from "mongoose";

export interface ChatDTO {
  username: string;
  chat: string;
  role: number;
  createdAt: Date;
}

export interface QuestionDTO {
  idx: number;
  username: string;
  question: string;
  role: number;
  answered: boolean;
  vote: number;
  createdAt: Date;
}

export interface ResultDTO {
  username: string;
  answer: string;
  correct: boolean;
  createdAt: Date;
}

export interface QResultDTO {
  question: number;
  result: ResultDTO[];
}

export interface GameDTO {
  game: string;
  groupId: Types.ObjectId;
  presentationId: Types.ObjectId;
  chat: ChatDTO[];
  ended: boolean;
  createdAt: Date;
}
