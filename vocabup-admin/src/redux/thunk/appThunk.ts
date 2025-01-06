import { createAsyncThunk } from "@reduxjs/toolkit";
import { MemberService } from "../../service";
import { AxiosError } from "axios";

export type LoginForm = {
  email: string;
  password: string;
  role: string | "admin" | "user";
};

export type Admin = {
  uid: string;
  role: "admin" | "user";
  fullName: object;
  email: string;
  tel: string | null;
  dob: Date | null;
  gender: "female" | "male" | "other";
  address: object;
  avatar: string | null;
  language: "vi" | "en";
  theme: "light" | "dark";
};

export const login = createAsyncThunk(
  "app/submitFormLogin",
  async (payload: LoginForm, { rejectWithValue }) => {
    try {
      const adminInfo = await MemberService.submitFormLogin(payload);
      if (adminInfo?.data) return adminInfo.data;
      else
        return rejectWithValue(
          (adminInfo as unknown as AxiosError).response!.data
        );
    } catch (err) {
      return rejectWithValue((err as AxiosError).response!.data);
    }
  }
);

export const getAccountInfo = createAsyncThunk(
  "app/account-info",
  async (_, { rejectWithValue }) => {
    try {
      const accountInfo = await MemberService.getAccountInfo();
      if (accountInfo?.data) return accountInfo.data;
      else
        return rejectWithValue(
          (accountInfo as unknown as AxiosError).response!.data
        );
    } catch (err) {
      return rejectWithValue((err as AxiosError).response!.data);
    }
  }
);
