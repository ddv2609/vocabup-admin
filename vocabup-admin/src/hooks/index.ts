import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, IRootState } from "../store";

export { default as useAuth } from "./useAuth";

export const useReduxDispatch = useDispatch.withTypes<AppDispatch>();
export const useReduxSelector = useSelector.withTypes<IRootState>();
