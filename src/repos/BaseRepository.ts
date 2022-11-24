import BaseModel, { IBase } from "@src/domains/models/Base";
import { model, Model, Types } from "mongoose";

export default class BaseRepository<T1 extends BaseModel, T2 extends IBase> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected set: Model<any>;

  constructor(baseModel: T1) {
    this.set = model(baseModel.modelName, baseModel.schema);
  }

  async all(): Promise<T2[]> {
    const result = await this.set.find();
    return result;
  }

  async get(_id: Types.ObjectId) {
    // eslint-disable-next-line object-shorthand
    const result = await this.set.findOne({ _id: _id });
    return result;
  }
}
