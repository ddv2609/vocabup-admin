import axiosInstance from "../axios";
import { Params } from "../types";
import { getQueryParams } from "../utils";

const getAppNotifications = async (
  currPage: number,
  size: number,
  filters: Params
) => {
  return await axiosInstance.get(
    `/notifications/app?currPage=${currPage}&size=${size}&${getQueryParams(
      filters
    )}`
  );
};

const pushAppNotification = async (
  title: string,
  message: string,
  image: File
) => {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("title", title);
  formData.append("message", message);

  return await axiosInstance.post("/notifications/app", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteAppNotification = async (notificationId: string) => {
  return await axiosInstance.delete(`/notifications/app/${notificationId}`);
};

export default {
  getAppNotifications,
  pushAppNotification,
  deleteAppNotification,
};
