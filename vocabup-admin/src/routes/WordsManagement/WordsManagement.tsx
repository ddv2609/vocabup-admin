import React, { useEffect, useState } from "react";
import { VocabService, WordService } from "../../service";
import {
  Avatar,
  Button,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tooltip,
} from "antd";
import { Page, Params, Word } from "../../types";

import styles from "./WordsManagement.module.scss";
import { TbAbc, TbPencilPlus } from "react-icons/tb";
import { MdEditCalendar } from "react-icons/md";
import { LoadingOutlined } from "@ant-design/icons";

import clsx from "clsx";
import useStyle from "../../hooks/useStyle";
import { BiDetail } from "react-icons/bi";
import { useReduxDispatch } from "../../hooks";
import {
  callMessage,
  setCurrentWord,
  toggleActionWordModal,
} from "../../redux/slice";
import { RxReload } from "react-icons/rx";
import emitter from "../../utils/EventEmitter";
import { EventEmit, MessageType } from "../../constants";
import { IoToday } from "react-icons/io5";
import { AiOutlineDelete } from "react-icons/ai";
import FilterWords from "../../components/FilterWords";
import TextEllipsis from "../../components/TextEllipsis";
import { FormattedMessage, useIntl } from "react-intl";

const WordsManagement: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const { styles: antdStyles } = useStyle();
  const [wordsLoading, setWordsLoading] = useState<boolean>(false);

  const [pageInfo, setPageInfo] = useState<Page>({
    currPage: 0,
    size: 10,
    totalRecords: 0,
  });

  const [filterInfo, setFilterInfo] = useState<Params>({
    q: "",
    poses: "",
    topics: "",
  });

  const dispatch = useReduxDispatch();
  const openActionWordModal = () => dispatch(toggleActionWordModal(true));
  const closeActionWordModal = () => dispatch(toggleActionWordModal(false));
  const intl = useIntl();

  const getWordsInfo = async (needPage: number, size: number) => {
    setWordsLoading(true);
    const { data: response, status } = await VocabService.getAllWords(
      needPage - 1,
      size,
      filterInfo
    );

    if (status < 400) {
      setWords(response.data.words);
      setPageInfo((prev) => ({
        ...prev,
        size,
        currPage: response.data.words?.length ? needPage : needPage - 1,
        totalRecords: response.data.totalWords,
      }));
    }

    setWordsLoading(false);
  };

  const handleChangePage = async (page: number, pageSize: number) => {
    await getWordsInfo(page, pageSize);
  };

  const handleChangeFilterInfo = (key: string, val: string) =>
    setFilterInfo((prev) => ({ ...prev, [key]: val }));

  const handleReload = async () => {
    await getWordsInfo(pageInfo.currPage, pageInfo.size);
  };

  const handleAddWord = () => {
    dispatch(setCurrentWord({ _id: "new" } as Word));
    openActionWordModal();
  };

  const handleViewDetailWord = (record: Word) => {
    dispatch(setCurrentWord(record));
    openActionWordModal();
  };

  const handleGetWordOfTheDay = async () => {
    openActionWordModal();
    const { data: response, status } = await WordService.getTodayWord();
    if (status < 400) {
      dispatch(setCurrentWord({ ...response.data.today, isToday: true }));
    } else {
      closeActionWordModal();
    }
  };

  const handleChangeWordOfTheDay = async () => {};

  const handleDeleteWords = async (wordIds: string[]) => {
    const { data: response, status } = await WordService.deleteWords(wordIds);

    if (status === 200) {
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );

      setWords((prev) => prev.filter((word) => !wordIds.includes(word._id)));
    }

    return Promise.resolve();
  };

  const handleFilterWords = async () => {
    setWordsLoading(true);
    const { data: response, status } = await VocabService.getAllWords(
      0,
      pageInfo.size,
      filterInfo
    );

    if (status < 400) {
      setWords(response.data.words);
      setPageInfo((prev) => ({
        ...prev,
        currPage: 1,
        totalRecords: response.data.totalWords,
      }));
    }

    setWordsLoading(false);
  };

  useEffect(() => {
    getWordsInfo(1, pageInfo.size);

    const handleListenVocabUpdate = (updatedWord: Word) => {
      const wordFound = words.find(
        (word: Word) => word._id === updatedWord._id
      );

      if (wordFound?._id) {
        setWords((prev) =>
          prev.map((word) => {
            if (word._id !== updatedWord._id) return word;
            else return updatedWord;
          })
        );
      } else {
        setWords((prev) => [...prev, updatedWord]);
      }
    };

    emitter.on(EventEmit.UpdateVocab, handleListenVocabUpdate);

    return () => {
      emitter.off(EventEmit.UpdateVocab, handleListenVocabUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableProps<Word>["columns"] = [
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
              // size={32}
              src={<img src={image} alt="Vocab Image" />}
            />
          ) : (
            <Avatar icon={<TbAbc />} />
          )}
        </>
      ),
      width: 100,
      fixed: "left",
      align: "center",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.word" />
        </span>
      ),
      dataIndex: "word",
      key: "word",
      render: (word) => <span className="txt---400-14-18-regular">{word}</span>,
      width: 100,
      fixed: "left",
      align: "center",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.translation" />
        </span>
      ),
      dataIndex: "translation",
      key: "translation",
      render: (translation) => (
        <span className="txt---400-14-18-regular">{translation}</span>
      ),
      width: 100,
      fixed: "left",
      align: "center",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.topic" />
        </span>
      ),
      dataIndex: "topics",
      key: "topics",
      render: (topics) => (
        <div className={styles.topicContainer}>
          {topics.map((topic: string | { topic: string }, index: number) => (
            <div
              key={index}
              className={clsx(["txt---400-14-18-regular", styles.topic])}
            >
              {(topic as { topic: string }).topic || (topic as string)}
            </div>
          ))}
        </div>
      ),
      // width: 100,
      ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.pos" />
        </span>
      ),
      dataIndex: "pos",
      key: "pos",
      render: (pos) => (
        <div className={styles.posContainer}>
          {pos.map((item: string, index: number) => (
            <div
              key={index}
              className={clsx([
                "txt---400-14-18-regular",
                styles.partOfSpeech,
                styles[item],
              ])}
            >
              {item}
            </div>
          ))}
        </div>
      ),
      width: "15%",
      align: "center",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.synonyms" />
        </span>
      ),
      dataIndex: "synonyms",
      key: "synonyms",
      render: (synonyms) => (
        // <p className="txt---400-14-18-regular">{synonyms.join(", ")}</p>
        <TextEllipsis
          texts={synonyms}
          placement="bottomRight"
          amount={2}
          arrow={false}
        />
      ),
      ellipsis: true,
      width: "10%",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.antonyms" />
        </span>
      ),
      dataIndex: "antonyms",
      key: "antonyms",
      render: (antonyms) => (
        // <p className="txt---400-14-18-regular">{antonyms.join(", ")}</p>
        <TextEllipsis
          texts={antonyms}
          placement="bottomRight"
          amount={2}
          arrow={false}
        />
      ),
      ellipsis: true,
      width: "10%",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.actions" />
        </span>
      ),
      key: "action",
      render: (record: Word) => (
        <div className={styles.actionsContainer}>
          <Tooltip title={<FormattedMessage id="common.view-detail" />}>
            <button
              className={clsx([styles.btnAction, styles.seeDetail])}
              onClick={() => handleViewDetailWord(record)}
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
                id: "words-management.confirm-delete-word",
              })}
              okText={intl.formatMessage({ id: "common.ok" })}
              cancelText={intl.formatMessage({ id: "common.cancel" })}
              placement="topLeft"
              onConfirm={() => handleDeleteWords([record._id])}
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
      ellipsis: true,
    },
  ];

  return (
    <div className={styles.wordsManagementContainer}>
      <div className={styles.tableWordsInfoContainer}>
        <Table<Word>
          columns={columns}
          dataSource={words}
          className={antdStyles.customTable}
          size="small"
          rowKey="_id"
          scroll={{ x: "max-content", y: 420 }}
          title={() => (
            <div className={styles.tableHeaderContainer}>
              {/* <h3 className={clsx(["txt---400-16-20-regular", styles.heading])}>
                List Of Words
              </h3> */}
              <FilterWords
                filterInfo={filterInfo}
                handleChangeFilterInfo={handleChangeFilterInfo}
                handleFilterWords={handleFilterWords}
              />
              <Space className={styles.actions}>
                <Tooltip title="Change today's word" placement="top">
                  <Button
                    icon={<MdEditCalendar />}
                    shape="circle"
                    onClick={handleChangeWordOfTheDay}
                  />
                </Tooltip>
                <Tooltip title="Today's word" placement="top">
                  <Button
                    icon={<IoToday />}
                    shape="circle"
                    onClick={handleGetWordOfTheDay}
                  />
                </Tooltip>
                <Tooltip title="Add word" placement="topRight">
                  <Button
                    icon={<TbPencilPlus />}
                    shape="circle"
                    onClick={handleAddWord}
                  />
                </Tooltip>
                <Tooltip title="Reload" placement="topRight">
                  <Button
                    icon={<RxReload />}
                    shape="circle"
                    onClick={handleReload}
                  />
                </Tooltip>
              </Space>
            </div>
          )}
          loading={{
            spinning: wordsLoading,
            indicator: <LoadingOutlined spin />,
          }}
          rowSelection={{
            type: "checkbox",
          }}
          pagination={{
            pageSize: pageInfo.size,
            current: pageInfo.currPage || 1,
            total: pageInfo.totalRecords,
            onChange: handleChangePage,
          }}
        />
      </div>
    </div>
  );
};

export default WordsManagement;
