import React, { Fragment, useEffect, useState } from "react";

import styles from "./Comments.module.scss";
import { Comment, Post } from "../../types/post";
import clsx from "clsx";
import {
  Avatar,
  Button,
  Dropdown,
  MenuProps,
  Skeleton,
  Space,
  Spin,
} from "antd";
import { FaKey, FaUser } from "react-icons/fa6";
import { BlogService } from "../../service";
import { CiCircleChevDown, CiCircleChevRight } from "react-icons/ci";
import moment from "moment";
import { HiDotsHorizontal } from "react-icons/hi";
import { PiNotePencilBold, PiTrashSimpleBold } from "react-icons/pi";
import { MenuInfo } from "rc-menu/lib/interface";
import { LoadingOutlined } from "@ant-design/icons";
import EnterComment from "./EnterComment";
import { FormattedMessage } from "react-intl";

type CommentsProps = {
  currPost: Post;
  comments: Comment[];
  toggleStatus: boolean;
  subComment?: boolean;
  loading?: boolean;
  onViewAuthorInfo: (authorId: string) => void;
  onDeleteComment: (
    comment: Comment,
    successCb: (data: Partial<Comment>) => void
  ) => Promise<void>;
  onAddComment: (
    postId: string,
    parentId: string | null,
    comment: string,
    successCb: (data: Partial<Comment>) => void
  ) => Promise<void>;
  replyComment?: Comment;
};

const Comments: React.FC<CommentsProps> = ({
  currPost,
  comments,
  toggleStatus,
  subComment = false,
  loading,
  replyComment,
  onViewAuthorInfo,
  onDeleteComment,
  onAddComment,
}) => {
  const [currentCommentId, setCurrentCommentId] = useState<string>("");
  const [currentReplyComment, setCurrentReplyComment] = useState<Comment>();
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);

  const handleChangeCurrentCommentId = (commentId: string) =>
    setCurrentCommentId(commentId);

  const loadRepliesComment = async (parentId: string) => {
    if (!parentId) return;
    setLoadingReplies(true);
    const { data: response, status } = await BlogService.getCommentsReply(
      parentId
    );

    if (status < 400) {
      setReplies(response.data.comments);
    }
    setLoadingReplies(false);
  };

  const handleDeleteCurrentComment = (commentId: string) => {
    onDeleteComment(
      {
        _id: commentId,
      } as Comment,
      (deletedComment) => {
        if (deletedComment.parentId) {
          setReplies((prev) =>
            prev.filter((comment) => comment._id !== deletedComment._id)
          );
        } else {
          setReplies([]);
          setCurrentCommentId("");
        }
      }
    );
  };

  const handlePostComment = async (
    postId: string,
    parentId: string | null,
    comment: string
  ) => {
    onAddComment(postId, parentId, comment, (newComment: Partial<Comment>) => {
      if (newComment.parentId)
        setReplies((prev) => [...prev, newComment as Comment]);
    });
  };

  const handleSelectAction = ({ key }: MenuInfo, commentId: string) => {
    switch (key) {
      case "edit":
        // TODO: Handle edit notification
        break;
      case "delete":
        handleDeleteCurrentComment(commentId);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    loadRepliesComment(currentCommentId);
  }, [currentCommentId]);

  useEffect(() => {
    if (!toggleStatus) {
      setReplies([]);
      setCurrentCommentId("");
    }
  }, [toggleStatus]);

  const itemActions: MenuProps["items"] = [
    {
      key: "edit",
      label: (
        <Space size={8} align="center">
          <PiNotePencilBold color="var(--see-detail-button)" />
          <span className={"txt---400-12-16-regular"}>
            <FormattedMessage id="common.edit" />
          </span>
        </Space>
      ),
    },
    {
      key: "delete",
      label: (
        <Space size={8} align="center">
          <PiTrashSimpleBold color="var(--delete-button)" />
          <span className={"txt---400-12-16-regular"}>
            <FormattedMessage id="common.delete" />
          </span>
        </Space>
      ),
    },
  ];

  return (
    <div
      className={clsx(
        styles.commentsContainer,
        toggleStatus ? styles.show : styles.hide,
        subComment ? styles.childrenComment : ""
      )}
    >
      {loading && (
        <div className={styles.loadingScreen}>
          {Array(8)
            .fill(0)
            .map((_: number, index: number) => {
              const randomWidth = Math.floor(Math.random() * 300) + 100;

              const randomSize = ["small", "default", "large"][
                Math.floor(Math.random() * 3)
              ];
              return (
                <div
                  key={index}
                  className={styles.commentSkeleton}
                  style={{
                    maxWidth: `${randomWidth}px`,
                  }}
                >
                  <Skeleton.Avatar active={true} size={28} shape="circle" />
                  <Skeleton.Input
                    active
                    size={
                      randomSize as "small" | "default" | "large" | undefined
                    }
                  />
                </div>
              );
            })}
        </div>
      )}
      <div className={clsx([styles.commentsWrapper, styles.subComment])}>
        {comments.map((comment: Comment) => (
          <Fragment key={comment._id}>
            <div className={styles.commentItem}>
              <div className={styles.commentItemWrapper}>
                <div
                  className={styles.authorAvatar}
                  onClick={() => onViewAuthorInfo(comment.author._id!)}
                >
                  {subComment && <div className={styles.connectParent} />}
                  <Avatar
                    src={comment.author?.avatar}
                    icon={comment.author?.avatar || <FaUser />}
                    shape="circle"
                    size={28}
                  />
                </div>
                <div className={styles.commentContentWrapper}>
                  <div className={styles.commentContent}>
                    {((!subComment && comment.replies > 0) ||
                      currentReplyComment?._id === comment._id) && (
                      <div
                        className={clsx([
                          styles.line,
                          comment._id === currentCommentId && replies.length
                            ? styles.showSubComments
                            : "",
                        ])}
                      />
                    )}
                    <div
                      className={clsx([
                        styles.authorName,
                        "txt---600-12-16-bold",
                      ])}
                      onClick={() => onViewAuthorInfo(comment.author._id!)}
                    >
                      {`${comment.author.fullName?.firstName} ${comment.author.fullName?.lastName}`}{" "}
                      {comment.author.role === "admin" && (
                        <div
                          className={styles.adminMarkup}
                          title="Quản trị viên"
                        >
                          <FaKey />
                        </div>
                      )}
                    </div>
                    <div
                      className={clsx([
                        styles.content,
                        "txt---400-14-18-regular",
                      ])}
                    >
                      {comment.comment}
                      <div
                        className={clsx(styles.time, "txt---600-10-14-bold")}
                      >
                        {moment(comment.updatedAt).format("DD/MM/YYYY hh:MM")}
                      </div>
                      <div className={styles.commentActions}>
                        <Dropdown
                          menu={{
                            items: itemActions,
                            onClick: (info) =>
                              handleSelectAction(info, comment._id),
                          }}
                          placement="bottomCenter"
                          arrow={false}
                          trigger={["click"]}
                        >
                          <Button
                            icon={<HiDotsHorizontal />}
                            shape="circle"
                            size="small"
                            type="default"
                          />
                        </Dropdown>
                      </div>
                    </div>
                    {!subComment && comment.replies === 0 && (
                      <div
                        className={clsx([
                          styles.replyComment,
                          "txt---600-12-16-bold",
                        ])}
                        onClick={() => {
                          if (currentReplyComment?._id === comment._id) {
                            setCurrentReplyComment({} as Comment);
                          } else {
                            setCurrentReplyComment(comment);
                          }
                          setCurrentCommentId("");
                        }}
                      >
                        <FormattedMessage id="posts-management.reply" />
                      </div>
                    )}
                  </div>
                  {!subComment && comment.replies > 0 && (
                    <div
                      className={clsx([
                        "txt---600-12-16-bold",
                        styles.repliesDesc,
                      ])}
                      onClick={() => {
                        if (currentCommentId === comment._id)
                          handleChangeCurrentCommentId("");
                        else handleChangeCurrentCommentId(comment._id);
                        setReplies([]);
                        setCurrentReplyComment({} as Comment);
                      }}
                    >
                      <div className={styles.connectParent} />
                      {loadingReplies && currentCommentId === comment._id ? (
                        <Spin
                          spinning={loadingReplies}
                          indicator={<LoadingOutlined />}
                          size="small"
                        />
                      ) : (
                        <>
                          {currentCommentId === comment._id ? (
                            <>
                              <span className={styles.expandIcon}>
                                <CiCircleChevDown />
                              </span>{" "}
                              <FormattedMessage id="common.hide" />
                            </>
                          ) : (
                            <>
                              <span className={styles.collapseIcon}>
                                <CiCircleChevRight />
                              </span>{" "}
                              <FormattedMessage id="common.view" />
                            </>
                          )}{" "}
                          {`${comment.replies}`}{" "}
                          <FormattedMessage
                            id={`posts-management.${
                              comment.replies > 1 ? "replies" : "reply-lower"
                            }`}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {!subComment &&
                comment.replies === 0 &&
                currentReplyComment?._id === comment._id && (
                  <>
                    <div className={styles.virtualReplyContainer} />
                    <EnterComment
                      subComment={true}
                      firstReply={true}
                      replyComment={comment}
                      onPostComment={handlePostComment}
                    />
                  </>
                )}
            </div>
            {comment._id === currentCommentId && !loadingReplies && (
              <Comments
                toggleStatus={comment._id === currentCommentId}
                currPost={currPost}
                comments={replies}
                subComment={true}
                replyComment={comment}
                onViewAuthorInfo={onViewAuthorInfo}
                onDeleteComment={async (
                  comment: Comment,
                  successCb: (data: Partial<Comment>) => void
                ) => {
                  await onDeleteComment(comment, successCb);
                  setReplies((prev) =>
                    prev.filter((item) => item._id !== comment._id)
                  );
                  if (replies.length === 1) setCurrentCommentId("");
                }}
                onAddComment={handlePostComment}
              />
            )}
          </Fragment>
        ))}
        <EnterComment
          subComment={subComment}
          replyComment={
            (subComment
              ? currentReplyComment?._id
                ? currentReplyComment
                : replyComment
              : {
                  postId: currPost._id,
                }) as Comment
          }
          onPostComment={handlePostComment}
        />
      </div>
    </div>
  );
};

export default Comments;
