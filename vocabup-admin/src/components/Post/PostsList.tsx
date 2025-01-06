import { forwardRef, useEffect, useState } from "react";

import styles from "./PostsList.module.scss";
import { Comment, Post } from "../../types/post";
import {
  Avatar,
  Button,
  Dropdown,
  Image,
  MenuProps,
  Space,
  Spin,
  Typography,
} from "antd";
import clsx from "clsx";
import moment from "moment";
import { MEDIA_TYPE, MessageType } from "../../constants";
import {
  FaHeart,
  FaKey,
  FaRegComment,
  FaRegHeart,
  FaUser,
} from "react-icons/fa6";
import { NumericFormat } from "react-number-format";
import { BlogService, MemberService } from "../../service";
import Comments from "./Comments";
import { LoadingOutlined } from "@ant-design/icons";
import { HiDotsHorizontal } from "react-icons/hi";
import { MenuInfo } from "rc-menu/lib/interface";
import { useReduxDispatch } from "../../hooks";
import { callMessage, loadingFullScreen } from "../../redux/slice";
import { User } from "../../types";
import DetailUserModal from "../Modal/DetailUserModal";
import { FormattedMessage } from "react-intl";

type PostsListProps = {
  posts: Post[];
  loadingNextPosts: boolean;
  onDeletePost: (stageId: string) => void;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
};

const PostsList = forwardRef<HTMLDivElement, PostsListProps>(
  ({ posts, loadingNextPosts, onDeletePost, setPosts }, ref) => {
    const [previewVisible, setPreviewVisible] = useState<string>();
    const [currActivePostId, setCurrActivePostId] = useState<string>("");
    const [currentAuthor, setCurrentAuthor] = useState<User>();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);
    const [expanded, setExpanded] = useState(false);

    const [toggleDetailAuthorModal, setToggleDetailAuthorModal] =
      useState<boolean>(false);

    const dispatch = useReduxDispatch();

    const itemActions: MenuProps["items"] = [
      {
        key: "edit",
        label: <span className={"txt---400-12-16-regular"}>Edit</span>,
      },
      {
        key: "delete",
        label: <span className={"txt---400-12-16-regular"}>Delete</span>,
      },
    ];

    const handlePreviewImage = (postId: string) => setPreviewVisible(postId);
    const handleToggleComments = (postId: string) => {
      if (currActivePostId) setComments([]);
      setCurrActivePostId(postId);
    };

    const handleToggleDetailAuthorModal = () =>
      setToggleDetailAuthorModal((prev) => !prev);

    const handleDeleteComment = async (
      comment: Comment,
      successCb: (comment: Partial<Comment>) => void
    ) => {
      dispatch(loadingFullScreen(true));
      const { data: response, status } = await BlogService.deleteComment(
        comment._id
      );

      if (status < 400) {
        const deletedComment = response.data;
        if (!deletedComment.parentId) {
          setComments((prev) =>
            prev.filter((item: Comment) => item._id !== deletedComment._id)
          );
        } else {
          setComments((prev) =>
            prev.map((item: Comment) => {
              if (item._id !== deletedComment.parentId) return item;
              return {
                ...item,
                replies: item.replies - 1,
              };
            })
          );
        }
        setPosts((prev) =>
          prev.map((item: Post) => {
            if (item._id !== currActivePostId) return item;
            return {
              ...item,
              commentAmount: item.commentAmount - deletedComment.deleted,
            };
          })
        );
        successCb(deletedComment);
        dispatch(
          callMessage({
            type: MessageType.SUCCESS,
            content: response.message,
          })
        );
      }
      dispatch(loadingFullScreen(false));
    };

    const handleAddComment = async (
      postId: string,
      parentId: string | null,
      comment: string,
      successCb: (comment: Partial<Comment>) => void
    ) => {
      dispatch(loadingFullScreen(true));
      const { data: response, status } = await BlogService.addComment(
        postId,
        parentId,
        comment
      );

      if (status < 400) {
        const newComment = response.data;
        if (newComment.parentId) {
          setComments((prev) =>
            prev.map((item: Comment) => {
              if (item._id !== newComment.parentId) return item;
              return {
                ...item,
                replies: item.replies + 1,
              };
            })
          );
        } else {
          setComments((prev) => [...prev, newComment]);
        }
        setPosts((prev) =>
          prev.map((item: Post) => {
            if (item._id !== currActivePostId) return item;
            return {
              ...item,
              commentAmount: item.commentAmount + 1,
            };
          })
        );
        successCb(newComment);
        dispatch(
          callMessage({
            type: MessageType.SUCCESS,
            content: response.message,
          })
        );
      }
      dispatch(loadingFullScreen(false));
    };

    const loadCommentsPost = async (postId: string) => {
      if (!postId) return;
      setLoadingComments(true);
      const { data: response, status } = await BlogService.getCommentsPost(
        postId
      );

      if (status < 400) {
        setComments(response.data.comments);
      }
      setLoadingComments(false);
    };

    const loadAuthorInfo = async (authorId: string) => {
      if (!authorId) return;
      dispatch(loadingFullScreen(true));

      const { data: response, status } = await MemberService.getMemberInfo(
        authorId
      );

      if (status < 400) {
        setCurrentAuthor(response.data.info);
      } else {
        dispatch(
          callMessage({
            type: MessageType.ERROR,
            content: response.message,
          })
        );
      }

      dispatch(loadingFullScreen(false));
    };

    const handleSelectAction = ({ key }: MenuInfo, postId: string) => {
      switch (key) {
        case "edit":
          // TODO: Handle edit notification
          break;
        case "delete":
          onDeletePost(postId);
          break;
        default:
          break;
      }
    };

    const handleReactPost = async (postId: string) => {
      const { data: response, status } = await BlogService.reactPost(postId);

      if (status < 400) {
        setPosts((prev) =>
          prev.map((post: Post) => {
            if (post._id !== postId) return post;
            return {
              ...post,
              reacts: post.reacts + (post.reacted ? -1 : 1),
              reacted: !post.reacted,
            };
          })
        );
      } else {
        dispatch(
          callMessage({
            type: MessageType.ERROR,
            content: response.message,
          })
        );
      }
    };

    useEffect(() => {
      loadCommentsPost(currActivePostId);
    }, [currActivePostId]);

    return (
      <div className={styles.postsListContainer}>
        {posts.map((post) => (
          <div className={styles.postWrapper} key={post._id}>
            <div className={styles.postHeader}>
              <div className={styles.authorAvatar}>
                <Avatar
                  src={post.author?.avatar}
                  icon={post.author?.avatar || <FaUser />}
                  shape="circle"
                  size={42}
                />
              </div>
              <div className={styles.authorInfo}>
                <div
                  className={clsx([styles.authorName, "txt---600-14-18-bold"])}
                  onClick={() => {
                    loadAuthorInfo(post.author._id);
                    handleToggleDetailAuthorModal();
                  }}
                >
                  {`${post.author.fullName.firstName} ${post.author.fullName.lastName}`}
                  {post.author.role === "admin" && (
                    <div className={styles.adminMarkup} title="Quản trị viên">
                      <FaKey />
                    </div>
                  )}
                </div>
                <div
                  className={clsx([styles.postDate, "txt---600-12-16-bold"])}
                >
                  {moment(post.createdAt).format("DD-MM-YYYY HH:MM")}
                </div>
              </div>
            </div>

            <div className={styles.postContent}>
              <Typography.Paragraph
                ellipsis={{
                  rows: 10,
                  expandable: "collapsible",
                  expanded,
                  onExpand: (_, info) => setExpanded(info.expanded),
                  symbol: expanded ? (
                    <span className="txt---600-14-18-bold">Thu gọn</span>
                  ) : (
                    <span className="txt---600-14-18-bold">Xem thêm</span>
                  ),
                }}
              >
                {post.content}
              </Typography.Paragraph>
            </div>

            <div className={styles.postMedias}>
              <Image.PreviewGroup
                preview={{
                  visible: previewVisible === post._id,
                  onVisibleChange: (value: boolean) => {
                    if (!value) setPreviewVisible("");
                  },
                }}
                items={post.mediaFiles
                  .filter((file) => file.fileType === MEDIA_TYPE.IMAGE)
                  .map((file) => file.fileUrl)}
              >
                {post.mediaFiles
                  .filter((media) => media.fileType === MEDIA_TYPE.IMAGE)
                  .slice(0, 2)
                  .map((file) => (
                    <div
                      className={styles.mediaFile}
                      key={file.fileId}
                      onClick={() => handlePreviewImage(post._id)}
                    >
                      <Image src={file.fileUrl} />
                    </div>
                  ))}

                {post.mediaFiles[2]?.fileType === MEDIA_TYPE.IMAGE && (
                  <div
                    className={clsx([styles.overlayWrapper, styles.mediaFile])}
                  >
                    <div
                      className={styles.overlay}
                      onClick={() => handlePreviewImage(post._id)}
                    >
                      {post.mediaFiles.filter(
                        (media) => media.fileType === MEDIA_TYPE.IMAGE
                      ).length > 3 && (
                        <strong>
                          +
                          {post.mediaFiles.filter(
                            (media) => media.fileType === MEDIA_TYPE.IMAGE
                          ).length - 3}
                        </strong>
                      )}
                    </div>
                    <Image src={post.mediaFiles[2].fileUrl} />
                  </div>
                )}
              </Image.PreviewGroup>
            </div>

            <div className={styles.postActions}>
              <Space>
                <span
                  className={clsx([
                    styles.reactIcon,
                    post.reacted ? styles.reacted : "",
                  ])}
                  onClick={() => handleReactPost(post._id)}
                >
                  {post.reacted ? <FaHeart /> : <FaRegHeart />}
                </span>
                <span className="txt---600-14-18-bold">
                  <NumericFormat
                    value={post.reacts}
                    displayType="text"
                    thousandSeparator={","}
                  />{" "}
                  <FormattedMessage id="posts-management.reacts" />
                </span>
              </Space>
              <Space
                className={styles.commentAction}
                onClick={() => {
                  // if (post.commentAmount) {
                  // }
                  if (currActivePostId === post._id) handleToggleComments("");
                  else handleToggleComments(post._id);
                }}
              >
                <span className={styles.commentIcon}>
                  <FaRegComment />
                </span>
                <span className="txt---600-14-18-bold">
                  <FormattedMessage id="posts-management.comment" />
                  {` (${post.commentAmount})`}
                </span>
              </Space>
            </div>
            <Comments
              toggleStatus={currActivePostId === post._id}
              currPost={post}
              comments={comments}
              loading={loadingComments}
              onViewAuthorInfo={(authorId: string) => {
                loadAuthorInfo(authorId);
                handleToggleDetailAuthorModal();
              }}
              onDeleteComment={handleDeleteComment}
              onAddComment={handleAddComment}
            />
            <div className={styles.actionBtn}>
              <Dropdown
                menu={{
                  items: itemActions,
                  onClick: (info) => handleSelectAction(info, post._id),
                }}
                placement="bottomRight"
                arrow={false}
                trigger={["click"]}
              >
                <Button
                  icon={<HiDotsHorizontal />}
                  shape="circle"
                  size="middle"
                  type="text"
                />
              </Dropdown>
            </div>
          </div>
        ))}
        <div
          ref={ref}
          // style={{ height: "20px", backgroundColor: "transparent" }}
          className={styles.nextPostsLoader}
        >
          <Spin
            spinning={loadingNextPosts}
            indicator={<LoadingOutlined />}
            size="default"
          />
        </div>

        {currentAuthor?._id && (
          <DetailUserModal
            user={currentAuthor}
            modalStatus={toggleDetailAuthorModal}
            onCancel={() => {
              handleToggleDetailAuthorModal();
              setCurrentAuthor({} as User);
            }}
          />
        )}
      </div>
    );
  }
);

export default PostsList;
