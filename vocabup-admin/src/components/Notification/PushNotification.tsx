import React, { useEffect, useRef, useState } from "react";

import styles from "./PushNotification.module.scss";
import clsx from "clsx";
import { Button, Image, Input, Upload, UploadFile } from "antd";
import TextArea from "antd/es/input/TextArea";
import { UploadOutlined } from "@ant-design/icons";
import { LuSmilePlus } from "react-icons/lu";
import EmojiPicker from "emoji-picker-react";
import { useDispatch } from "react-redux";
import { callMessage, loadingFullScreen } from "../../redux/slice";
import { EventEmit, MessageType } from "../../constants";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { NotificationService } from "../../service";
import emitter from "../../utils/EventEmitter";

type NotificationPayload = {
  title: string;
  message: string;
  image?: File | Blob | null;
};

const PushNotification: React.FC = () => {
  const dispatch = useDispatch();
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [toggleEmojiPickerTitle, setToggleEmojiPickerTitle] =
    useState<boolean>(false);

  const [toggleEmojiPickerMsg, setToggleEmojiPickerMsg] =
    useState<boolean>(false);

  const [notification, setNotification] = useState<NotificationPayload>({
    title: "",
    message: "",
    image: null,
  });

  const [imageLocal, setImageLocal] = useState<UploadFile>({
    uid: "",
    name: "",
    url: "",
    status: "removed",
  });

  const emojiPickerTitleRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerMsgRef = useRef<HTMLDivElement | null>(null);

  const handleToggleEPTitle = (status: boolean) =>
    setToggleEmojiPickerTitle(status);
  const handleToggleEPMsg = (status: boolean) =>
    setToggleEmojiPickerMsg(status);

  const handleChangeNotificationInfo = (
    key: string,
    val: string | File | Blob | null
  ) => setNotification((prev) => ({ ...prev, [key]: val }));

  const handleClearNotification = () => {
    setNotification({
      title: "",
      message: "",
      image: null,
    });
  };

  const handleClearImageLocal = () => {
    URL.revokeObjectURL(imageLocal.url!);
    setImageLocal({
      uid: "",
      name: "",
      url: "",
      status: "removed",
    });
  };

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
      URL.revokeObjectURL(imageLocal.url!);
      const imageLocalUrl = URL.createObjectURL(file);
      setImageLocal((prev) => ({
        ...prev,
        status: "uploading",
        url: imageLocalUrl,
        name: file.name || "no-name-image",
      }));
    }

    return true;
  };

  const handlePushNotification = async () => {
    dispatch(loadingFullScreen(true));
    const { data: response, status } =
      await NotificationService.pushAppNotification(
        notification.title,
        notification.message,
        notification.image as File
      );

    if (status < 400) {
      emitter.emit(EventEmit.PushAppNotification, response.data);
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );

      handleClearNotification();
      handleClearImageLocal();
      dispatch(loadingFullScreen(false));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleEmojiPickerTitle &&
        emojiPickerTitleRef.current &&
        !emojiPickerTitleRef.current.contains(event.target as Node)
      ) {
        handleToggleEPTitle(false);
      }

      if (
        toggleEmojiPickerMsg &&
        emojiPickerMsgRef.current &&
        !emojiPickerMsgRef.current.contains(event.target as Node)
      ) {
        handleToggleEPMsg(false);
      }
    };

    if (toggleEmojiPickerMsg || toggleEmojiPickerTitle) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [toggleEmojiPickerMsg, toggleEmojiPickerTitle]);

  return (
    <div className={styles.pushNotificationContainer}>
      <div className={styles.headingContainer}>
        <h3
          className={clsx([
            styles.headingContent,
            "txt---600-16-20-bold text-center",
          ])}
        >
          New push notification
        </h3>
      </div>

      <div className={styles.formPushContainer}>
        <div className={styles.textInputWrapper}>
          <div className={styles.titleWrapper}>
            <div
              className={clsx([
                styles.label,
                "txt---600-14-18-bold text-right",
              ])}
            >
              Title
            </div>
            <div className={styles.content}>
              <Input
                placeholder="Enter notification title"
                size="large"
                value={notification.title}
                onChange={(e) =>
                  handleChangeNotificationInfo("title", e.target.value)
                }
              />
            </div>

            <span
              className={styles.emoji}
              onClick={() => handleToggleEPTitle(true)}
            >
              <LuSmilePlus />
            </span>
            {toggleEmojiPickerTitle && (
              <div className={styles.emojiContainer} ref={emojiPickerTitleRef}>
                <EmojiPicker
                  className={styles.emojiPicker}
                  onEmojiClick={(emojiData) =>
                    setNotification((prev) => ({
                      ...prev,
                      title: prev.title + emojiData.emoji,
                    }))
                  }
                />
              </div>
            )}
          </div>

          <div className={styles.titleWrapper}>
            <div
              className={clsx([
                styles.label,
                "txt---600-14-18-bold text-right",
              ])}
            >
              Message
            </div>
            <div className={styles.content}>
              <TextArea
                placeholder="Enter notification content"
                rows={5}
                value={notification.message}
                onChange={(e) =>
                  handleChangeNotificationInfo("message", e.target.value)
                }
              />
            </div>

            <span
              className={styles.emoji}
              onClick={() => handleToggleEPMsg(true)}
            >
              <LuSmilePlus />
            </span>
            {toggleEmojiPickerMsg && (
              <div className={styles.emojiContainer} ref={emojiPickerMsgRef}>
                <EmojiPicker
                  className={styles.emojiPicker}
                  onEmojiClick={(emojiData) =>
                    setNotification((prev) => ({
                      ...prev,
                      message: prev.message + emojiData.emoji,
                    }))
                  }
                />
              </div>
            )}
          </div>

          <div className={styles.titleWrapper}>
            <div
              className={clsx([
                styles.label,
                "txt---600-14-18-bold text-right",
              ])}
            >
              Send to
            </div>
            <div
              className={clsx([
                styles.content,
                "txt---600-14-18-bold text-left",
              ])}
            >
              Push notification will be sent to all users with an image
            </div>
          </div>

          <div className={styles.titleWrapper}>
            <div className={styles.label}></div>
            <div className={styles.content}>
              <Button
                className="txt---600-14-18-regular"
                type="primary"
                onClick={handlePushNotification}
                disabled={!notification.title || !notification.message}
              >
                Send notification
              </Button>
            </div>
          </div>
        </div>

        <div className={styles.uploadImageWrapper}>
          {/* <span className={clsx([styles.uploadTitle, "txt---600-14-18-bold"])}>
            Image
          </span> */}
          <div className={styles.uploadWrapper}>
            <Upload
              name="image"
              // listType="picture-circle"
              className={styles.imageUploader}
              accept="image/*"
              maxCount={1}
              showUploadList={true}
              fileList={imageLocal.name ? [imageLocal] : []}
              customRequest={async (options: UploadRequestOption) => {
                setImageLocal((prev) => ({
                  ...prev,
                  status: "done",
                }));

                handleChangeNotificationInfo("image", options.file);

                await Promise.resolve(true);
              }}
              beforeUpload={beforeUpload}
              onRemove={() => {
                handleChangeNotificationInfo("image", null);
                setImageLocal((prev) => ({
                  ...prev,
                  url: "",
                  name: "",
                  status: "removed",
                }));
              }}
            >
              <Button size="middle" icon={<UploadOutlined />}>
                <span className="txt---600-14-18-bold">Image</span>
              </Button>
            </Upload>
          </div>
          <div className={styles.imageWrapper}>
            <Image
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
              }}
              src={imageLocal.url}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotification;
