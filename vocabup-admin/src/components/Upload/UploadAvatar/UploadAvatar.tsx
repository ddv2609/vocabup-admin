import React, { useState } from "react";
import styles from "../UploadImage/UploadImage.module.scss";
import { Avatar, Button, Dropdown, Image, Space, Spin, Upload } from "antd";
import { EditOutlined, EyeOutlined, LoadingOutlined } from "@ant-design/icons";
import { useReduxDispatch } from "../../../hooks";
import { callMessage } from "../../../redux/slice";
import { MessageType } from "../../../constants";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Admin, User } from "../../../types";
import { FaUser, FaUserShield } from "react-icons/fa6";

type UploadImageProps = {
  src: string | null | undefined;
  obj: User | Admin | null;
  imageShape?: "circle" | "square";
  handleUploadImage: (
    options: UploadRequestOption,
    afterUpload: () => void
  ) => Promise<void>;
  handleDeleteImage: (afterDelete: () => void) => Promise<void>;
};

const UploadAvatar: React.FC<UploadImageProps> = ({
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

  const editOptions = [
    {
      key: "0",
      label: (
        <div
          onClick={() => setOpenDropdown(false)}
          className="txt---400-14-18-regular"
        >
          Update
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
          Delete
        </div>
      ),
    },
  ];

  const beforeUpload = (file: File) => {
    if (!file.type.match(/image.*/) || obj?._id?.includes("new")) {
      dispatch(
        callMessage({
          type: MessageType.ERROR,
          content: "Bạn chỉ có thể tải file ảnh lên!",
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
        disabled={!openDropdown || obj?._id?.includes("new")}
      >
        <div className={styles.uploadWrapper}>
          <div className={styles.imageUpload} onClick={handleOpenPreview}>
            {upload ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            ) : (
              <>
                {obj && obj.avatar ? (
                  <Avatar
                    shape={imageShape}
                    className={styles.image}
                    src={obj?.avatar}
                  />
                ) : (
                  <Avatar
                    shape={imageShape}
                    className={styles.image}
                    style={{ fontSize: "48px" }}
                    icon={obj?.role === "admin" ? <FaUserShield /> : <FaUser />}
                  />
                )}
                <EyeOutlined className={styles.iconEye} />
              </>
            )}
          </div>
          {!obj?._id?.includes("new") && (
            <Dropdown
              menu={{ items: obj?.avatarId ? editOptions : [editOptions[0]] }}
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
                  Edit
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

export default UploadAvatar;
