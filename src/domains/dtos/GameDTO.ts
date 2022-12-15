import { Types } from "mongoose";

export interface ChatDTO {
  username: string;
  chat: string;
  createdAt: Date;
}

export interface GameDTO {
  game: string;
  presentationId: Types.ObjectId;
  chat: ChatDTO[];
  ended: boolean;
  createdAt: Date;
}
