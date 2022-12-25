export interface User {
  id: string;
  username: string;
  game: string;
}

export interface AnswerCounter {
  id: string;
  count: number;
}

export interface Game {
  game: string;
  presentation: string;
  users: User[];
  cohosts: User[];
  group: string | null;
  slide: number;
  answer: AnswerCounter[];
  showAnswer: boolean;
}

export interface Group {
  id: string;
  name: string;
  createdAt: Date;
}
