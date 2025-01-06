import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { WordService } from "../../service";
import { TopicPayload } from "../../service/wordService";
import { ResponseState } from ".";
import { callMessage } from "../slice";

export const getAllTopics = createAsyncThunk(
  "word/getAllTopics",
  async (_payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await WordService.getAllTopics({ q: "" });
      // dispatch(
      //   callMessage({
      //     type: "success",
      //     content: response.data.message,
      //   })
      // );
      return response.data;
    } catch (err) {
      dispatch(
        callMessage({
          type: "error",
          content:
            ((err as AxiosError).response!.data as ResponseState).message ||
            "Lỗi không xác định <topicThunk.ts>",
        })
      );
      return rejectWithValue((err as AxiosError).response!.data);
    }
  }
);

export const addNewTopics = createAsyncThunk(
  "word/addNewTopic",
  async (payload: TopicPayload[], { dispatch, rejectWithValue }) => {
    try {
      const response = await WordService.createNewTopics(payload);
      dispatch(
        callMessage({
          type: "success",
          content: response.data.message,
        })
      );
      return response.data;
    } catch (err) {
      dispatch(
        callMessage({
          type: "error",
          content:
            ((err as AxiosError).response!.data as ResponseState).message ||
            "Lỗi không xác định <topicThunk.ts>",
        })
      );
      return rejectWithValue((err as AxiosError).response!.data);
    }
  }
);
