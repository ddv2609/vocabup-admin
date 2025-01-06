import React, { useEffect, useRef, useState } from "react";
import styles from "./BlogsManagement.module.scss";
import MultiImages from "../../components/Upload/MultiUpload/MultiImages";
import { FileUploaded, Params } from "../../types";
import { Button } from "antd";
import { BlogService } from "../../service";
import { useReduxDispatch } from "../../hooks";
import { callMessage, loadingFullScreen } from "../../redux/slice";
import { MessageType } from "../../constants";
import { Post } from "../../types/post";
import PostsList from "../../components/Post/PostsList";
import _ from "lodash";
import TextArea from "antd/es/input/TextArea";
import clsx from "clsx";
import { RiSendPlaneFill } from "react-icons/ri";
import FilterPosts from "../../components/FilterPosts";
import moment from "moment";
import { FormattedMessage, useIntl } from "react-intl";

// type NewPost = {
//   title: string;
//   content: string;
//   files: File[];
// };

const BlogsManagement: React.FC = () => {
  const dispatch = useReduxDispatch();

  const [imagesList, setImagesList] = useState<FileUploaded[]>([]);
  const [postedList, setPostedList] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState({
    title: "",
    content: "",
  });
  // const [newPostInfo, setNewPostInfo] = useState<NewPost>();
  const [pageInfo, setPageInfo] = useState({
    currPage: 0,
    pageSize: 10,
    hasNextPage: true,
  });

  const [loadingNextPosts, setLoadingNextPosts] = useState<boolean>(false);

  const [filterInfo, setFilterInfo] = useState<Params>({
    query: "",
    author: null,
    fromDate: null,
    toDate: null,
    minViews: -1,
    maxViews: -1,
    minReacts: 0,
  });

  const loaderRef = useRef<HTMLDivElement>(null);
  const intl = useIntl();

  const handleChangeFilterInfo = (
    key: string,
    val: string | number | boolean | unknown | null | undefined
  ) => setFilterInfo((prev) => ({ ...prev, [key]: val }));

  const handleChangePostContent = (key: string, val: string) =>
    setPostContent((prev) => ({
      ...prev,
      [key]: val,
    }));

  const handleChangeImagesList = (image: FileUploaded) => {
    setImagesList((prev) => [image, ...prev]);
  };

  const handleChangeLastUploadedImage = (extraInfo: Partial<FileUploaded>) => {
    setImagesList((prev) => [
      {
        ...(prev.find((file) => file.uid === extraInfo.uid) as FileUploaded),
        ...extraInfo,
      },
      ...prev.filter((file) => file.uid !== extraInfo.uid),
    ]);
  };

  const handleRemoveUploadedImage = (file: FileUploaded) => {
    setImagesList((prev) => prev.filter((image) => image.uid !== file.uid));
    URL.revokeObjectURL(file.thumbUrl as string);
  };

  const handleCreateBlog = async () => {
    dispatch(loadingFullScreen(true));
    const { data: response, status } = await BlogService.postAdminBlog(
      postContent.title,
      postContent.content,
      imagesList.map((image) => image.file)
    );

    if (status < 400) {
      setPostedList((prev) => [response.data.post, ...prev]);
      setImagesList([]);
      setPostContent((prev) => ({
        ...prev,
        title: "",
        content: "",
      }));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );

      dispatch(loadingFullScreen(false));
    }
  };

  const loadPosts = async (page?: number, size?: number) => {
    setLoadingNextPosts(true);
    const { data: response, status } = await BlogService.getPosts({
      page: _.isNumber(page) ? page : pageInfo.currPage,
      size: _.isNumber(size) ? size : pageInfo.pageSize,
      ...{
        ...filterInfo,
        fromDate: filterInfo.fromDate
          ? moment(filterInfo.fromDate as string, "YYYY-MM-DD")
          : null,
        toDate: filterInfo.toDate
          ? moment(filterInfo.toDate as string, "YYYY-MM-DD")
          : null,
      },
    });

    if (status < 400) {
      switch (response.data.page) {
        case pageInfo.currPage + 1:
          setPostedList((prev) => [...prev, ...response.data.posts]);
          break;
        default:
          setPostedList(response.data.posts);
          break;
      }

      setPageInfo((prev) => ({
        ...prev,
        currPage: response.data.page,
        pageSize: response.data.size,
        hasNextPage: response.data.hasNextPost,
      }));
    }
    setLoadingNextPosts(false);
  };

  const handleDeletePost = async (postId: string) => {
    dispatch(loadingFullScreen(true));
    const { data: response, status } = await BlogService.deletePost(postId);

    if (status < 400) {
      setPostedList((prev) => prev.filter((post) => post._id !== postId));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }

    dispatch(loadingFullScreen(false));
  };

  // useEffect(() => {
  //   loadPosts();
  // }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          !loadingNextPosts &&
          pageInfo.hasNextPage
        ) {
          loadPosts(pageInfo.currPage, pageInfo.pageSize);
        }
      },
      {
        root: null,
        rootMargin: "36px",
        threshold: 1.0,
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loadingNextPosts, pageInfo]);

  return (
    <div className={styles.blogsManagementContainer}>
      <div className={styles.postedListContainer}>
        <PostsList
          ref={loaderRef}
          posts={postedList}
          loadingNextPosts={loadingNextPosts}
          onDeletePost={handleDeletePost}
          setPosts={setPostedList}
        />
      </div>

      <div className={styles.verticalLine} />

      <div className={styles.postContainer}>
        <FilterPosts
          filterInfo={filterInfo}
          handleChangeFilterInfo={handleChangeFilterInfo}
          handleFilterPosts={async () => {
            dispatch(loadingFullScreen(true));
            await loadPosts(0, pageInfo.pageSize);
            dispatch(loadingFullScreen(false));
          }}
        />
        <div className={styles.contentPost}>
          {/* <div className={styles.subjectWrapper}>
            <div className={clsx([styles.title, "txt---600-16-20-bold"])}>
              Tiêu đề bài đăng
            </div>
            <Input
              placeholder="Nhập tiêu đề bài đăng"
              value={postContent.title}
              onChange={(e) => handleChangePostContent("title", e.target.value)}
            />
          </div> */}
          <div className={styles.mainContentWrapper}>
            <div className={clsx([styles.title, "txt---600-16-20-bold"])}>
              <FormattedMessage id="posts-management.post-content" />
            </div>
            <TextArea
              placeholder={intl.formatMessage({
                id: "posts-management.enter-post-content",
              })}
              rows={10}
              value={postContent.content}
              onChange={(e) =>
                handleChangePostContent("content", e.target.value)
              }
            />
          </div>
        </div>
        <div className={styles.postUploadWrapper}>
          <MultiImages
            imagesList={imagesList}
            onChangeImagesList={handleChangeImagesList}
            onChangeLastUploadedImage={handleChangeLastUploadedImage}
            onRemoveUploadedImage={handleRemoveUploadedImage}
          />
          <Button
            className={styles.postBtn}
            icon={<RiSendPlaneFill />}
            onClick={handleCreateBlog}
          >
            <span className="txt---600-14-18-bold">
              <FormattedMessage id="posts-management.post" />
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogsManagement;
