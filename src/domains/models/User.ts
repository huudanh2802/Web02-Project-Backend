/* eslint-disable no-underscore-dangle */
import { ModelName } from "@src/declarations/enums";
import EnvVars from "@src/declarations/major/EnvVars";
import { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import BaseModel, { IBase } from "./Base";

export interface IUser extends IBase {
  email: string;
  password: string;
  role: number; // 0: Teacher, 1: Student
  emailToken: string | null;
  active: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: Number, required: true, default: 0 },
    // eslint-disable-next-line no-bitwise
    emailToken: { type: String },
    active: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

userSchema.methods = {
  createToken() {
    return jwt.sign(
      {
        _id: this._id
      },
      EnvVars.cookieProps.secret
    );
  },
  toJSON() {
    return {
      _id: this._id,
      userName: this.email,
      token: `JWT ${this.createToken()}`
    };
  }
};

export class UserModel extends BaseModel {
  schema = userSchema;

  modelName = ModelName.UserModel;
}
