/* eslint-disable no-underscore-dangle */
import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IRealtime extends IBase {
  link: number;
  member: string[];
  presentationId: Types.ObjectId;
  ownerId: Types.ObjectId;
}

const realtimeSchema = new Schema<IRealtime>(
  {
    link: { type: Number, required: true },
    member: { type: [String] },
    presentationId: { type: Schema.Types.ObjectId, required: true },
    ownerId: { type: Schema.Types.ObjectId, required: true }
  },
  {
    timestamps: true
  }
);

export class RealtimeModel extends BaseModel {
  schema = realtimeSchema;

  modelName = ModelName.RealtimeModel;
}
