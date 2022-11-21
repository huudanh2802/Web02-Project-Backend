import { ModelName } from "@src/declarations/enums";
import { Schema } from "mongoose";
import BaseModel, { IBase } from "./Base";

export interface IUser extends IBase {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

export class UserModel extends BaseModel {
  schema = userSchema;

  modelName = ModelName.UserModel;
}
