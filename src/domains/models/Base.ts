import { ModelName } from "@src/declarations/enums";
import { Schema, Types } from "mongoose";

export interface IBase {
  id: Types.ObjectId;
}

export default abstract class BaseModel {
  abstract schema: Schema;

  abstract modelName: ModelName;
}
