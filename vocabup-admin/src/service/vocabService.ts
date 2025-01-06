import axiosInstance from "../axios";
import { Params } from "../types";
import { getQueryParams } from "../utils";

const getAllWords = async (
  currPage: number,
  limit: number,
  otherParams: Params
) => {
  return await axiosInstance.get(
    `/vocabs/words?page=${currPage}&size=${limit}&${getQueryParams(
      otherParams
    )}`
  );
};

export default {
  getAllWords,
};
