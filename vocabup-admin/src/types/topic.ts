export interface Topic {
  _id: string;
  topic: string;
  image: string | null;
  imageId: string | null;
}

export interface TopicsResponse {
  message: string | null;
  data: { topics: Topic[] };
}
