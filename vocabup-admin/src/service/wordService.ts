import axiosInstance from "../axios";
import { Definition, Example, Params, Topic, Word } from "../types";
import { getQueryParams } from "../utils";

export type TopicPayload = {
  topic: string;
};

const getAllTopics = async (filterInfo: Params) => {
  return await axiosInstance.get(`/topics?${getQueryParams(filterInfo)}`);
};

const createNewTopics = async (payload: TopicPayload[]) => {
  return await axiosInstance.post("/topics", { topics: payload });
};

const updateTopicImage = async (
  topicId: string,
  oldImageId: string | null | undefined,
  file: FormData
) => {
  return await axiosInstance.post(
    `/topics/image/${topicId}/${oldImageId || "create"}`,
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const deleteTopicImage = async (topicId: string, oldImageId: string) => {
  return await axiosInstance.delete(`/topics/image/${topicId}/${oldImageId}`);
};

const updateWordImage = async (
  wordId: string,
  oldImageId: string | null | undefined,
  file: FormData
) => {
  return await axiosInstance.post(
    `/vocabs/image/${wordId}/${oldImageId || "create"}`,
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const deleteWordImage = async (wordId: string, oldImageId: string) => {
  return await axiosInstance.delete(`/vocabs/image/${wordId}/${oldImageId}`);
};

const addNewTopic = async (topics: string[]) => {
  return await axiosInstance.post("/topics/", {
    topics: topics.map((topic) => ({ topic })),
  });
};

const deleteTopics = async (topicIDs: string[]) => {
  return await axiosInstance.post("/topics/delete-topics/", {
    topicIDs,
  });
};

const searchTopics = async (q: string) => {
  return axiosInstance.get(`/topics/search?${getQueryParams({ q })}`);
};

const getTodayWord = async () => {
  return await axiosInstance.get("/vocabs/word-of-the-day");
};

const createNewWord = async (wordInfo: Partial<Word>) => {
  return await axiosInstance.post("/vocabs/word/", [wordInfo]);
};

const updateWord = async (wordInfo: Partial<Word>) => {
  return await axiosInstance.put("/vocabs/word/", wordInfo);
};

const deleteWords = async (wordIDs: string[]) => {
  return await axiosInstance.post("/vocabs/delete-words", {
    wordIDs,
  });
};

const updateWordPronunciation = async (wordId: string, form: FormData) => {
  return await axiosInstance.post(`/vocabs/${wordId}/pronunciation/`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteWordPronunciation = async (
  wordId: string,
  pronId: string,
  urlId: string
) => {
  return await axiosInstance.delete(`/vocabs/${wordId}/${pronId}/${urlId}`);
};

const updateWordDefinition = async (
  wordId: string,
  definition: Partial<Definition>
) => {
  return await axiosInstance.post(`/vocabs/${wordId}/definition`, {
    definition,
  });
};

const deleteWordDefinition = async (wordId: string, defId: string) => {
  return await axiosInstance.delete(`/vocabs/${wordId}/${defId}/`);
};

const updateDefinitionExample = async (
  wordId: string,
  defId: string,
  example: Partial<Example>
) => {
  return await axiosInstance.post(`/vocabs/${wordId}/${defId}/example`, {
    example,
  });
};

const deleteDefinitionExample = async (
  wordId: string,
  defId: string,
  exampleId: string
) => {
  return await axiosInstance.delete(`/vocabs/${wordId}/${defId}/${exampleId}`);
};

const searchWords = async (q: string) => {
  return await axiosInstance.get(
    `/vocabs/words/search?${getQueryParams({ q })}`
  );
};

const updateTopic = async (topic: Partial<Topic>) => {
  return axiosInstance.put("/topics/", { topic });
};

export default {
  getAllTopics,
  createNewTopics,
  updateTopicImage,
  deleteTopicImage,
  updateWordImage,
  deleteWordImage,
  addNewTopic,
  deleteTopics,
  getTodayWord,
  createNewWord,
  deleteWords,
  updateWordPronunciation,
  deleteWordPronunciation,
  updateWordDefinition,
  deleteWordDefinition,
  updateDefinitionExample,
  deleteDefinitionExample,
  updateWord,
  searchWords,
  searchTopics,
  updateTopic,
};
