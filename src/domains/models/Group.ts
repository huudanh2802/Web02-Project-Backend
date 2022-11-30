/* eslint-disable no-underscore-dangle */
import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IGroup extends IBase {
  name: string;
  owner: Types.ObjectId;
  coowner: Types.ObjectId[];
  member: Types.ObjectId[];
  link: number;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, required: true },
    coowner: { type: [Schema.Types.ObjectId], required: true },
    member: { type: [Schema.Types.ObjectId], required: true },
    link: { type: Number, required: true }
  },
  {
    timestamps: true
  }
);

export class GroupModel extends BaseModel {
  schema = groupSchema;

  modelName = ModelName.GroupModel;
}
