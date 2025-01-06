import _ from "lodash";
import { Params } from "../types";

export const getQueryParams = (params: Params) => {
  return Object.keys(params as object)
    .map((key) =>
      !_.isNull(params[key]) &&
      !_.isUndefined(params[key]) &&
      !_.isNaN(params[key])
        ? `${key}=${params[key]}`
        : null
    )
    .filter((param) => param)
    .join("&");
};
