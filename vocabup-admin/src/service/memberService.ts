import axiosInstance from "../axios";
import { LoginForm } from "../redux/thunk";
import { Admin, Params, User } from "../types";
import { getQueryParams } from "../utils";

const submitFormLogin = async (payload: LoginForm) => {
  return await axiosInstance.post("/auth/login", payload);
};

const updateMemberAvatar = async (
  uid: string,
  oldAvatarId: string,
  file: FormData
) => {
  return await axiosInstance.post(
    `/members/avatar/${uid}/${oldAvatarId}`,
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const getUsersByPage = async (
  currPage: number,
  size: number,
  hidden: boolean,
  filterInfo: Params
) => {
  return await axiosInstance.get(
    `/members/users?${getQueryParams({
      page: currPage,
      size: size,
      hidden: hidden,
      ...filterInfo,
    })}`
  );
};

const getAdminsByPage = async (currPage: number, size: number) => {
  return await axiosInstance.get(
    `/members/admins?page=${currPage}&size=${size}`
  );
};

const searchAdmins = async (q: string) => {
  return await axiosInstance.get(`/members/admins?${getQueryParams({ q })}`);
};

const searchUsers = async (q: string) => {
  return axiosInstance.get(`/members/search?${getQueryParams({ q })}`);
};

const hideManyUsers = async (userIds: string[]) => {
  return await axiosInstance.post("/members/hidden/", {
    uids: userIds,
  });
};

const enableManyUsers = async (userIds: string[]) => {
  return await axiosInstance.post("/members/enable/", {
    uids: userIds,
  });
};

const getAccountInfo = async () => {
  return await axiosInstance.get("/members/information");
};

const getMemberInfo = async (uid: string) => {
  return axiosInstance.get(`/members/${uid}`);
};

const uploadAvatar = async (
  uid: string,
  aid: string | null | undefined,
  file: FormData
) => {
  return axiosInstance.post(`/members/avatar/${uid}/${aid}`, file, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteAvatar = async (uid: string, aid: string) => {
  return axiosInstance.delete(`/members/avatar/${uid}/${aid}`);
};

const updateMemberInfo = async (memberInfo: Partial<Admin | User>) => {
  return axiosInstance.post("/members/", memberInfo);
};

const deleteMembers = async (members: string[]) => {
  return axiosInstance.post("/members/delete", {
    uids: members,
  });
};

export default {
  submitFormLogin,
  updateMemberAvatar,
  getUsersByPage,
  getAdminsByPage,
  hideManyUsers,
  enableManyUsers,
  getAccountInfo,
  searchAdmins,
  searchUsers,
  getMemberInfo,
  uploadAvatar,
  deleteAvatar,
  updateMemberInfo,
  deleteMembers,
};
