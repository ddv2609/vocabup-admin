import React, { useRef, useState } from "react";

import styles from "./EnterComment.module.scss";
import { useReduxSelector } from "../../hooks";
import { FaUser } from "react-icons/fa6";
import { Avatar, Button, Popover } from "antd";
import TextArea from "antd/es/input/TextArea";
import clsx from "clsx";
import { RiSendPlane2Fill } from "react-icons/ri";
import { Comment } from "../../types/post";
import { LuSmilePlus } from "react-icons/lu";
import EmojiPicker from "emoji-picker-react";

type EnterCommentProps = {
  subComment: boolean;
  firstReply?: boolean;
  replyComment: Comment;
  onPostComment: (
    postId: string,
    parentId: string | null,
    comment: string
  ) => Promise<void>;
};

const EnterComment: React.FC<EnterCommentProps> = ({
  subComment,
  firstReply = false,
  replyComment,
  onPostComment,
}) => {
  const admin = useReduxSelector((state) => state.app.admin);
  const emojiPickerTitleRef = useRef<HTMLDivElement | null>(null);

  const [comment, setComment] = useState<Comment>({
    parentId: replyComment?._id || null,
    comment: "",
    postId: replyComment.postId,
  } as Comment);

  const handleChangeCommentInfo = (key: string, val: string) =>
    setComment(
      (prev) =>
        ({
          ...prev,
          [key]: val,
        } as Comment)
    );

  const handlePostComment = async () => {
    console.log(comment);
    if (!comment.comment.trim()) return;
    await onPostComment(
      comment.postId,
      comment.parentId || null,
      comment.comment
    );
    setComment((prev) => ({
      ...prev,
      comment: "",
    }));
  };

  return (
    <div
      className={clsx([
        styles.enterCommentContainer,
        subComment ? styles.replyComment : "",
        firstReply ? styles.firstReply : "",
      ])}
    >
      <div className={styles.avatar}>
        {subComment && <div className={styles.connectParent} />}
        <Avatar
          src={admin?.avatar}
          icon={admin?.avatar || <FaUser />}
          shape="circle"
          size={28}
        />
      </div>
      <div className={styles.commentContent}>
        <TextArea
          className={clsx([styles.commentArea, "txt---400-14-18-regular"])}
          value={comment?.comment}
          autoSize={{
            minRows: 1,
          }}
          onChange={(e) => handleChangeCommentInfo("comment", e.target.value)}
        />
        <Popover
          content={
            <div className={styles.emojiContainer} ref={emojiPickerTitleRef}>
              <EmojiPicker
                className={styles.emojiPicker}
                onEmojiClick={(emojiData) =>
                  setComment((prev) => ({
                    ...prev,
                    comment: prev.comment + emojiData.emoji,
                  }))
                }
              />
            </div>
          }
          trigger={["click"]}
          placement="right"
        >
          <span className={styles.emoji}>
            <LuSmilePlus />
          </span>
        </Popover>
      </div>
      <Button
        className={styles.btnSend}
        type="link"
        shape="circle"
        size="large"
        disabled={!comment?.comment?.trim()}
        onClick={handlePostComment}
      >
        <RiSendPlane2Fill />
      </Button>
    </div>
  );
};

export default EnterComment;
