import axiosInstance from "../axios";
import { getQueryParams } from "../utils";

export type TypeDateQuery = "1M" | "3M" | "6M" | "1Y";
export type TypeStatisticQuery = "NEWUSER" | "NEWPOST";

const getGeneralStatistic = async () => {
  return await axiosInstance.get("/statistics/");
};

const getStatisticsByMonths = async (
  type: TypeStatisticQuery,
  typedate: TypeDateQuery
) => {
  return await axiosInstance.get(
    `/statistics/months?${getQueryParams({ type, typedate })}`
  );
};

const getStatisticsInOneYear = async (type: TypeStatisticQuery) => {
  return await axiosInstance.get(
    `/statistics/year?${getQueryParams({ type })}`
  );
};

export default {
  getGeneralStatistic,
  getStatisticsByMonths,
  getStatisticsInOneYear,
};
