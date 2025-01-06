import React, { useEffect, useState } from "react";

import styles from "./TopicsManagement.module.scss";
import {
  Avatar,
  Button,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tooltip,
} from "antd";
import { Topic } from "../../types/topic";
import { useReduxDispatch, useReduxSelector } from "../../hooks";
import useStyle from "../../hooks/useStyle";
import clsx from "clsx";
import { LoadingOutlined } from "@ant-design/icons";
import { TbCategoryPlus } from "react-icons/tb";
import { RxReload } from "react-icons/rx";

import { BiDetail, BiSolidCategoryAlt } from "react-icons/bi";
import { AiOutlineDelete } from "react-icons/ai";
import { WordService } from "../../service";
import {
  callMessage,
  setCurrentTopic,
  setTopics as setReduxTopics,
} from "../../redux/slice";
// import { LuWholeWord } from "react-icons/lu";
import { EventEmit, MessageType, ActionType } from "../../constants";
import FilterTopics from "../../components/FilterTopics";
import { Params } from "../../types";
import emitter from "../../utils/EventEmitter";
import { FormattedMessage, useIntl } from "react-intl";

const TopicsManagement: React.FC = () => {
  const allTopics = useReduxSelector((state) => state.word.topics);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState<boolean>(false);
  const [filterInfo, setFilterInfo] = useState<Params>({
    q: "",
  });
  const { styles: antdStyles } = useStyle();
  const intl = useIntl();

  const dispatch = useReduxDispatch();

  const handleGetAllTopics = async () => {
    setTopicsLoading(true);
    const { data: response, status } = await WordService.getAllTopics(
      filterInfo
    );
    if (status < 400) {
      // dispatch(setTopics(response.data.topics));
      setTopics(response.data.topics);
    }
    setTopicsLoading(false);
  };

  const handleReloadTopics = () => {
    handleGetAllTopics();
  };

  const handleOpenActionTopicModal = (record: Topic) => {
    dispatch(setCurrentTopic(record));
  };

  const handleAddNewTopic = () => {
    dispatch(
      setCurrentTopic({
        _id: "new",
        topic: "",
        image: "",
        imageId: "",
      })
    );
  };

  const handleChangeFilterInfo = (key: string, val: string) =>
    setFilterInfo((prev) => ({ ...prev, [key]: val }));

  const handleDeleteTopics = async (topicIDs: string[]) => {
    const { data: response, status } = await WordService.deleteTopics(topicIDs);

    if (status < 400) {
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      setTopics((prev) =>
        prev.filter((topic: Topic) => !topicIDs.includes(topic._id))
      );
      dispatch(
        setReduxTopics(
          allTopics.filter((topic) => !topicIDs.includes(topic._id))
        )
      );
    }

    return Promise.resolve();
  };

  useEffect(() => {
    handleGetAllTopics();

    const handleListenActionWord = (payload: {
      topic: Topic;
      action: string;
      topics?: Topic[];
    }) => {
      switch (payload.action) {
        case ActionType.ADD:
          setTopics((prev) => [...prev, ...(payload.topics || [])]);
          break;
        case ActionType.UPDATE:
          setTopics((prev) =>
            prev.map((topic: Topic) => {
              if (topic._id !== payload.topic._id) return topic;
              return {
                ...topic,
                ...payload.topic,
              };
            })
          );
          break;
        case ActionType.DELETE:
          setTopics((prev) =>
            prev.filter((topic: Topic) => topic._id !== payload.topic._id)
          );
          break;
      }
    };

    emitter.on(EventEmit.ActionTopic, handleListenActionWord);

    return () => {
      emitter.off(EventEmit.ActionTopic, handleListenActionWord);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableProps<Topic>["columns"] = [
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.image-id" />
        </span>
      ),
      dataIndex: "imageId",
      key: "imageId",
      render: (imageId) => (
        <span className="txt---400-14-18-regular">
          {imageId || <FormattedMessage id="common.not-updated-yet" />}
        </span>
      ),
      width: "30%",
      align: "center",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.image" />
        </span>
      ),
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <>
          {image ? (
            <Avatar
              shape="square"
              size={42}
              src={<img src={image} alt="Vocab Image" />}
            />
          ) : (
            <Avatar icon={<BiSolidCategoryAlt />} />
          )}
        </>
      ),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.topic" />
        </span>
      ),
      dataIndex: "topic",
      key: "topic",
      render: (topic) => (
        <span className="txt---400-14-18-regular">{topic}</span>
      ),
      align: "center",
    },
    // {
    //   title: <span className="txt---600-14-18-bold">Words</span>,
    //   key: "words",
    //   render: (record: Topic) => (
    //     <div className={styles.actionsContainer}>
    //       <Tooltip title="View detail words in this topic">
    //         <button
    //           className={clsx([styles.btnAction, styles.seeDetail])}
    //           onClick={() => {
    //             console.log(record);
    //           }}
    //         >
    //           <LuWholeWord />
    //         </button>
    //       </Tooltip>
    //     </div>
    //   ),
    //   align: "center",
    // },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.actions" />
        </span>
      ),
      key: "action",
      render: (record: Topic) => (
        <div className={styles.actionsContainer}>
          <Tooltip title={<FormattedMessage id="common.view-detail" />}>
            <button
              className={clsx([styles.btnAction, styles.seeDetail])}
              onClick={() => handleOpenActionTopicModal(record)}
            >
              <BiDetail />
            </button>
          </Tooltip>
          <Tooltip title={<FormattedMessage id="common.delete" />}>
            <Popconfirm
              title={intl.formatMessage({
                id: "topics-management.confirm-delete",
              })}
              description={intl.formatMessage({
                id: "topics-management.confirm-delete-topic",
              })}
              placement="topLeft"
              onConfirm={() => handleDeleteTopics([record._id])}
              okText={intl.formatMessage({ id: "common.ok" })}
              cancelText={intl.formatMessage({ id: "common.cancel" })}
            >
              <button className={clsx([styles.btnAction, styles.delete])}>
                <AiOutlineDelete />
              </button>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
      width: 100,
      fixed: "right",
      align: "center",
    },
  ];

  return (
    <div className={styles.topicsManagementContainer}>
      <Table<Topic>
        columns={columns}
        dataSource={topics}
        className={antdStyles.customTable}
        size="small"
        rowKey="_id"
        scroll={{ x: "max-content", y: 420 }}
        title={() => (
          <div className={styles.tableHeaderContainer}>
            {/* <h3 className={clsx(["txt---400-16-20-regular", styles.heading])}>
              List Of Topics
            </h3> */}
            <FilterTopics
              filterInfo={filterInfo}
              handleChangeFilterInfo={handleChangeFilterInfo}
              handleFilterTopics={handleGetAllTopics}
            />
            <Space className={styles.actions}>
              <Tooltip
                title={<FormattedMessage id="topics-management.add-topic" />}
                placement="topRight"
              >
                <Button
                  icon={<TbCategoryPlus />}
                  shape="circle"
                  onClick={handleAddNewTopic}
                />
              </Tooltip>
              <Tooltip
                title={<FormattedMessage id="common.reload" />}
                placement="topRight"
              >
                <Button
                  icon={<RxReload />}
                  shape="circle"
                  onClick={handleReloadTopics}
                />
              </Tooltip>
            </Space>
          </div>
        )}
        rowSelection={{
          type: "checkbox",
        }}
        loading={{
          spinning: topicsLoading,
          indicator: <LoadingOutlined spin />,
        }}
        pagination={{
          pageSize: 100,
        }}
      />
    </div>
  );
};

export default TopicsManagement;
