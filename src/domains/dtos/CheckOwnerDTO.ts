import { Types } from "mongoose";

export default interface CheckOwnerDTO {
  ownerId: Types.ObjectId;
  groupId: Types.ObjectId;
}
