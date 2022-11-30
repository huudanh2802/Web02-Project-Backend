import MemberDTO from "./MemberDTO";

export default interface GroupInfoDTO {
  id: string;
  name: string;
  owner: MemberDTO;
  coowner: MemberDTO[];
  member: MemberDTO[];
}
