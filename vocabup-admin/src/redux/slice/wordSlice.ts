import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Word } from "../../types";
import { Topic } from "../../types/topic";
import { addNewTopics, getAllTopics } from "../thunk";

interface WordState {
  currentWord: Word | null;
  currentTopic: Topic | null;
  topics: Topic[];
}

const initialState: WordState = {
  currentWord: null,
  currentTopic: null,
  topics: [],
};

const wordSlice = createSlice({
  name: "word",
  initialState,
  reducers: {
    setCurrentWord: (state, action: PayloadAction<Word>) => {
      state.currentWord = action.payload;
    },
    setCurrentTopic: (state, action: PayloadAction<Topic | null>) => {
      state.currentTopic = action.payload;
    },
    setTopics: (state, action: PayloadAction<Topic[]>) => {
      state.topics = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllTopics.fulfilled, (state, action) => {
      state.topics = action.payload.data.topics;
    });

    builder.addCase(addNewTopics.fulfilled, (state, action) => {
      state.topics.push(...action.payload.data.topics);
    });
  },
});

export const { setCurrentWord, setCurrentTopic, setTopics } = wordSlice.actions;

export default wordSlice.reducer;

export type WordReducer = ReturnType<typeof wordSlice.reducer>;
