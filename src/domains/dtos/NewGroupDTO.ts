import MemberRoleDTO from "./MemberRoleDTO";

export default interface NewGroupDTO {
  name: string;
  owner: MemberRoleDTO;
  coowner: MemberRoleDTO[];
  member: MemberRoleDTO[];
}
