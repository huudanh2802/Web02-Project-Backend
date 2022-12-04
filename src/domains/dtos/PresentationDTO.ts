export interface AnswerDTO {
  id: string;
  answer: string;
  placeHolder: string;
}

export interface SlideDTO {
  idx: number;
  question: string;
  correct: string;
  answers: AnswerDTO[];
}

export default interface PresentationDTO {
  name: string;
  groupId: string;
  slides: SlideDTO[];
}
