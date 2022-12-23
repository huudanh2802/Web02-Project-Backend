export interface AnswerDTO {
  id: string;
  answer: string;
  placeHolder: string;
}

export type Slide = {
  idx: number;
};

export type MutipleChoiceDTO = Slide & {
  type: 1;
  question: string;
  correct: string;
  answers: AnswerDTO[];
};

export type HeadingDTO = Slide & {
  type: 2;
  heading: string;
};

export type ParagraphDTO = Slide & {
  type: 3;
  heading: string;
  paragraph: string;
};

export type SlideDTO = MutipleChoiceDTO | HeadingDTO | ParagraphDTO;
export interface PresentationDTO {
  name: string;
  creator: string;
  slides: SlideDTO[];
}
