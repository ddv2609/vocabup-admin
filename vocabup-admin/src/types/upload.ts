import { UploadFile } from "antd";

export type FileUploaded = Partial<UploadFile> & {
  file: File;
};
