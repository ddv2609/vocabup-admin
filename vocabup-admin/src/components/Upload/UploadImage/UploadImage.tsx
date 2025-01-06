import React, { useState } from "react";
import styles from "./UploadImage.module.scss";
import { Avatar, Button, Dropdown, Image, Space, Spin, Upload } from "antd";
import { EditOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";
import { useReduxDispatch } from "../../../hooks";
import { callMessage } from "../../../redux/slice";
import { MessageType } from "../../../constants";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Topic } from "../../../types/topic";
import { Word } from "../../../types";
import { TbCategoryPlus, TbPlus } from "react-icons/tb";
import { FormattedMessage, useIntl } from "react-intl";

type UploadImageProps = {
  src: string | null | undefined;
  obj: Topic | Word | null;
  imageShape?: "circle" | "square";
  handleUploadImage: (
    options: UploadRequestOption,
    afterUpload: () => void
  ) => Promise<void>;
  handleDeleteImage: (afterDelete: () => void) => Promise<void>;
};

const UploadImage: React.FC<UploadImageProps> = ({
  src,
  obj,
  imageShape = "circle",
  handleUploadImage,
  handleDeleteImage,
}) => {
  const dispatch = useReduxDispatch();

  const [upload, setUpLoad] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const handleOpenPreview = () => setPreviewOpen(true);
  const intl = useIntl();

  const editOptions = [
    {
      key: "0",
      label: (
        <div
          onClick={() => setOpenDropdown(false)}
          className="txt---400-14-18-regular"
        >
          <FormattedMessage id="common.update" />
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          className="txt---400-14-18-regular"
          onClick={async (e) => {
            e.stopPropagation();
            setUpLoad(true);
            await handleDeleteImage(() => setUpLoad(false));
          }}
        >
          <FormattedMessage id="common.delete" />
        </div>
      ),
    },
  ];

  const beforeUpload = (file: File) => {
    if (!file.type.match(/image.*/) || obj?._id.includes("new")) {
      dispatch(
        callMessage({
          type: MessageType.ERROR,
          content: intl.formatMessage({ id: "common.image-type-error" }),
        })
      );
      return Upload.LIST_IGNORE;
    } else {
      setUpLoad(true);
    }
    setOpenDropdown(false);
    return true;
  };

  return (
    <div className={styles.uploadImageContainer}>
      <Upload
        name="image"
        listType="picture-circle"
        className={styles.imageUploader}
        accept="image/*"
        maxCount={1}
        showUploadList={false}
        customRequest={async (options: UploadRequestOption) =>
          await handleUploadImage(options, () => {
            setUpLoad(false);
          })
        }
        beforeUpload={beforeUpload}
        disabled={!openDropdown || obj?._id.includes("new")}
      >
        <div className={styles.uploadWrapper}>
          <div className={styles.imageUpload} onClick={handleOpenPreview}>
            {upload ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            ) : (
              <>
                {obj && obj.image ? (
                  <Avatar
                    shape={imageShape}
                    className={styles.image}
                    src={obj?.image}
                  />
                ) : (
                  <Avatar
                    shape={imageShape}
                    className={styles.image}
                    style={{ fontSize: "48px" }}
                    icon={
                      obj?._id.includes("new") ? <TbCategoryPlus /> : <TbPlus />
                    }
                  />
                )}
                <EyeOutlined className={styles.iconEye} />
              </>
            )}
          </div>
          {!obj?._id.includes("new") && (
            <Dropdown
              menu={{ items: obj?.imageId ? editOptions : [editOptions[0]] }}
              open={openDropdown}
              trigger={["click"]}
              onOpenChange={(open) => setOpenDropdown(open)}
            >
              <Button
                className={styles.editBtn}
                onClick={() => setOpenDropdown(true)}
              >
                <Space>
                  <EditOutlined className={styles.editIcon} />
                  <FormattedMessage id="common.edit" />
                </Space>
              </Button>
            </Dropdown>
          )}
        </div>
      </Upload>
      {src && (
        <Image
          wrapperStyle={{
            display: "none",
          }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
          src={src}
        />
      )}
    </div>
  );
};

export default UploadImage;
