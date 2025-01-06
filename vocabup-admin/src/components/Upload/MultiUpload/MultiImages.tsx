import React from "react";

import { UploadOutlined } from "@ant-design/icons";

import styles from "./MultiImage.module.scss";
import { Button, Upload, UploadFile } from "antd";
import { dispatch } from "../../../store";
import { callMessage } from "../../../redux/slice";
import { MessageType } from "../../../constants";
import { FileUploaded } from "../../../types";
import { UploadRequestOption } from "rc-upload/lib/interface";
import _ from "lodash";
import { FormattedMessage } from "react-intl";

type MultiImagesProps = {
  imagesList: FileUploaded[];
  onChangeImagesList: (image: FileUploaded) => void;
  onChangeLastUploadedImage: (extraInfo: Partial<FileUploaded>) => void;
  onRemoveUploadedImage: (image: FileUploaded) => void;
};

const MultiImages: React.FC<MultiImagesProps> = ({
  imagesList,
  onChangeImagesList,
  onChangeLastUploadedImage,
  onRemoveUploadedImage,
}) => {
  const beforeUpload = (file: File) => {
    if (!file.type.match(/image.*/)) {
      dispatch(
        callMessage({
          type: MessageType.ERROR,
          content: "Bạn chỉ có thể tải file ảnh lên!",
        })
      );
      return Upload.LIST_IGNORE;
    } else {
      const imageLocalUrl = URL.createObjectURL(file as Blob);
      // const randomUid = `${Date.now()}.${Math.random()}`;
      // currentFileUploaded.current = randomUid;
      onChangeImagesList({
        uid: file["uid" as keyof File],
        status: "uploading",
        name: file.name || `no-name-image-${Date.now()}`,
        file: file as File,
        thumbUrl: imageLocalUrl,
      } as FileUploaded);
    }
    return true;
  };

  return (
    <div className={styles.multiImagesContainer}>
      <Upload
        listType="picture"
        fileList={imagesList.map(
          (image: FileUploaded) => _.omit(image, ["blob"]) as UploadFile
        )}
        multiple
        beforeUpload={beforeUpload}
        customRequest={async (options: UploadRequestOption) => {
          const file = options.file as File;
          onChangeLastUploadedImage({
            uid: file["uid" as keyof File] as string,
            status: "done",
            file: file,
          });

          await Promise.resolve(true);
        }}
        onRemove={(file: UploadFile) => {
          onRemoveUploadedImage(file as FileUploaded);
        }}
      >
        <Button type="default" icon={<UploadOutlined />}>
          <span className="txt---600-14-18-bold">
            <FormattedMessage id="common.upload" />
          </span>
        </Button>
      </Upload>
    </div>
  );
};

export default MultiImages;
