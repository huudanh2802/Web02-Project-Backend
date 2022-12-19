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

export interface GameDTO {
  game: string;
  presentationId: Types.ObjectId;
  chat: ChatDTO[];
  ended: boolean;
  createdAt: Date;
}
