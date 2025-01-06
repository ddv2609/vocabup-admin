export interface Verb {
  _id: string;
  text: string;
  type: string;
}

export interface Pronunciation {
  _id: string;
  pos: string;
  lang: string;
  url: string;
  urlId?: string | null;
  pron: string;
}

export interface Example {
  _id: string;
  text: string;
  translation?: string;
}

export interface Definition {
  _id: string;
  pos: string;
  source?: string | null;
  text?: string | null;
  translation?: string | null;
  contextualMeaning?: string | null;
  example: Example[];
}

export interface Word {
  _id: string;
  word: string;
  baseWord?: Partial<Word>;
  variation?: string;
  pos: string[];
  verbs: Verb[];
  pronunciation: Pronunciation[] | [];
  definition: Definition[];
  synonyms: string[];
  antonyms: string[];
  topics: string[] | { topic: string }[];
  translation: string | null;
  image: string | null;
  imageId?: string | null;
  __v: number;
}

export interface Page {
  currPage: number;
  size: number;
  totalRecords: number;
}
