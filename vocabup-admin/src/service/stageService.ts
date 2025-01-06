import axiosInstance from "../axios";
import {
  Lesson,
  MatchingQuizz,
  OrderingQuizz,
  SingleChoiceQuizz,
  Stage,
} from "../types/stage";

const getAllStages = async () => {
  return await axiosInstance.get(`/stages/`);
};

const updateStage = async (transferBody: Partial<Stage>) => {
  return axiosInstance.put(`/stages/`, transferBody);
};

const addStage = async (transferBody: Partial<Stage>) => {
  return axiosInstance.post(`/stages/`, { stages: [transferBody] });
};

const deleteStage = async (stageId: string) => {
  return axiosInstance.delete(`/stages/${stageId}`);
};

const addLessonToStage = async (
  stageId: string,
  transferBody: Partial<Lesson>
) => {
  return axiosInstance.post(`/stages/${stageId}`, transferBody);
};

const updateLesson = async (stageId: string, transferBody: Partial<Lesson>) => {
  return axiosInstance.put(`/stages/${stageId}`, transferBody);
};

const deleteLesson = async (stageId: string, lessonId: string) => {
  return axiosInstance.delete(`/stages/${stageId}/${lessonId}`);
};

const getLessonQuizzes = async (quizzIds: string[]) => {
  return await axiosInstance.post(`/lessons/questions`, {
    lessonQuestionIds: quizzIds,
  });
};

const addQuizzToLesson = async (
  lessonId: string,
  lessonQuestionInfo: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz
) => {
  return await axiosInstance.post(`/lessons/questions/${lessonId}`, {
    lessonQuestion: lessonQuestionInfo,
  });
};

const updateQuizz = async (
  lessonQuestionInfo: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz
) => {
  return axiosInstance.put(`/lessons/questions`, {
    lessonQuestion: lessonQuestionInfo,
  });
};

const deleteQuizz = async (
  stageId: string,
  lessonId: string,
  lessonQuestionId: string
) => {
  return await axiosInstance.delete(
    `/lessons/${stageId}/${lessonId}/questions/${lessonQuestionId}`
  );
};

export default {
  getAllStages,
  addLessonToStage,
  getLessonQuizzes,
  addQuizzToLesson,
  deleteQuizz,
  updateQuizz,
  updateLesson,
  deleteLesson,
  updateStage,
  addStage,
  deleteStage,
};
