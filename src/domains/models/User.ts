/* eslint-disable no-underscore-dangle */
import { ModelName } from "@src/declarations/enums";
import { Schema } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IUser extends IBase {
  email: string;
  password: string;
  emailToken: string | null;
  active: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    // eslint-disable-next-line no-bitwise
    emailToken: { type: String },
    active: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export class UserModel extends BaseModel {
  schema = userSchema;

  modelName = ModelName.UserModel;
}
