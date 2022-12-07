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

  async get(id: Types.ObjectId) {
    // eslint-disable-next-line object-shorthand
    const result = await this.set.findOne({ _id: id });
    return result;
  }

  async create(createModel: T2) {
    const result = await this.set.create(createModel);
    return result;
  }

  async update(createModel: T2) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateModel } = createModel;
    const result = await this.set.findByIdAndUpdate(
      createModel.id,
      updateModel
    );
    return result;
  }

  async getMany(ids: Types.ObjectId[]): Promise<T2[]> {
    const result = await this.set.find({
      _id: {
        $in: ids
      }
    });
    return result;
  }

  async delete(id: Types.ObjectId) {
    const result = await this.set.deleteOne({ id });
    return result;
  }
}
