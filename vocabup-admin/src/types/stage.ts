import { Word } from "./word";

export interface Stage {
  _id: string;
  topic: string;
  part: number;
  description: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  newWords: { [key: string]: string }[];
  previousLesson: string;
  quizzes: string[] | ((MatchingQuizz & OrderingQuizz) | SingleChoiceQuizz)[];
  createdAt: string;
  updatedAt: string;
}

export interface Quizz {
  _id: string;
  type: "SINGLE_CHOICE_QUESTION" | "ORDERING_QUESTION" | "MATCHING_QUESTION";
  title: string;
  questionTextVi: string;
  questionTextEn: string;
  explanation: string;
  typeDetail:
    | "PAIR_QUIZZ"
    | "SORT_SENTENCE_EN-VI"
    | "SORT_SENTENCE_VI-EN"
    | "IMAGE_SELECTION_QUIZZ"
    | "TEXT_SELECTION_QUIZZ"
    | "LISTENING_SELECTION_QUIZZ";
}

export type MatchingQuizz = Partial<Quizz> & {
  pairs: Partial<Word>[];
};

export interface OrderingItem {
  _id: string;
  text: Partial<Word>;
  verbForm: string | null;
  variation: string | null;
  fromVocab: boolean;
  correctPosition: number;
  pos:
    | "noun"
    | "pronoun"
    | "verb"
    | "adverb"
    | "adjective"
    | "preposition"
    | "conjunction"
    | "interjection"
    | "idiom"
    | "phrase"
    | "determiner";
}

export type OrderingQuizz = Partial<Quizz> & {
  imageUrl: string | null;
  imageId: string | null;
  audioUrl: string | null;
  audioId: string | null;
  items: OrderingItem;
};

export type SingleChoiceQuizz = Partial<Quizz> & {
  imageUrl: string | null;
  imageId: string | null;
  audioUrl: string | null;
  audioId: string | null;
  options: Partial<Word>;
  correctAnswerIndex: number;
};
