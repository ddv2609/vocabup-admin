import {
  Button,
  Col,
  Input,
  Popconfirm,
  Row,
  Select,
  Table,
  TableProps,
  Tooltip,
  Upload,
} from "antd";
import React from "react";
import _ from "lodash";
import { UploadOutlined } from "@ant-design/icons";

import { AiFillPlusCircle, AiOutlineDelete } from "react-icons/ai";
import clsx from "clsx";
import { MdOpenInNew } from "react-icons/md";

import styles from "./Pronunciations.module.scss";
import { Pronunciation } from "../../types";
import { useReduxDispatch } from "../../hooks";
import { callMessage } from "../../redux/slice";
import { MessageType } from "../../constants";
import { FormattedMessage, useIntl } from "react-intl";

type PronunciationsProps = {
  partOfSpeeches: string[];
  handleDeletePron: (pid: string, urlId: string) => Promise<void>;
  langs: React.MutableRefObject<string[]>;
  pronunciations: Pronunciation[] | undefined;
  newPronunciation: Pronunciation & { audio: File | null };
  setNewPronunciation: React.Dispatch<
    React.SetStateAction<Pronunciation & { audio: File | null }>
  >;
  handleUpdatePronunciation: () => Promise<void>;
  handleRegainPron: (pid: string) => void;
  confirmLoading: boolean;
  handleRemoveTemp: (pid: string) => void;
};

const Pronunciations: React.FC<PronunciationsProps> = ({
  partOfSpeeches,
  handleDeletePron,
  langs,
  pronunciations,
  newPronunciation,
  setNewPronunciation,
  handleUpdatePronunciation,
  handleRegainPron,
  handleRemoveTemp,
  confirmLoading,
}) => {
  const dispatch = useReduxDispatch();
  const handleChangePronunciation = (
    obj: Partial<Pronunciation & { audio: File | null }>
  ) => {
    setNewPronunciation((prev) => ({
      ...prev,
      ...obj,
    }));
  };

  const intl = useIntl();

  const handleUpdatePron = (obj: Pronunciation) => {
    if (!newPronunciation._id.includes("new")) {
      handleRegainPron(newPronunciation._id);
    }
    setNewPronunciation((prev) => ({
      ...prev,
      ...obj,
    }));
    handleRemoveTemp(obj._id);
  };

  const beforeUploadAudioFile = (file: File) => {
    if (file.type === "audio/mpeg") {
      setNewPronunciation((prev) => ({
        ...prev,
        url: URL.createObjectURL(file),
        audio: file,
      }));

      return false;
    } else {
      dispatch(
        callMessage({
          type: MessageType.ERROR,
          content: "The system only supports MP3 format",
        })
      );
    }
    return Upload.LIST_IGNORE;
  };

  const columns: TableProps<Pronunciation>["columns"] = [
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.pos" />
        </span>
      ),
      dataIndex: "pos",
      key: "pos",
      render: (pos) => (
        <span
          className={clsx([
            "txt---400-14-18-regular",
            styles.partOfSpeech,
            styles[pos],
          ])}
        >
          {pos || "Invalid"}
        </span>
      ),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.lang" />
        </span>
      ),
      dataIndex: "lang",
      key: "lang",
      render: (lang) => (
        <div
          className={clsx([
            "txt---400-14-18-regular",
            styles.lang,
            styles[lang],
          ])}
        >
          {lang}
        </div>
      ),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.pron-file" />
        </span>
      ),
      dataIndex: "url",
      key: "url",
      render: (url) => (
        <span className="txt---400-14-18-regular">
          <audio src={url} controls />
        </span>
      ),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.pronunciation" />
        </span>
      ),
      dataIndex: "pron",
      key: "pron",
      render: (pron) => <span className="txt---400-14-18-regular">{pron}</span>,
      align: "center",
    },
    {
      title: "",
      key: "action",
      render: (record: Pronunciation) => (
        <div className={styles.actionsContainer}>
          <Tooltip title={<FormattedMessage id="common.delete" />}>
            <Popconfirm
              title={<FormattedMessage id="words-management.confirm-delete" />}
              description={
                <FormattedMessage id="words-management.confirm-delete-pronunciation" />
              }
              okText={<FormattedMessage id="common.ok" />}
              cancelText={<FormattedMessage id="common.cancel" />}
              onConfirm={async () => {
                await handleDeletePron(record._id, record.urlId || "no-id");
                return Promise.resolve();
              }}
            >
              <button
                className={clsx([styles.btnAction, styles.delete])}
                disabled={confirmLoading}
              >
                <AiOutlineDelete />
              </button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title={<FormattedMessage id="common.update" />}>
            <button
              className={clsx([styles.btnAction, styles.update])}
              onClick={() => handleUpdatePron(record)}
              disabled={confirmLoading}
            >
              <MdOpenInNew />
            </button>
          </Tooltip>
        </div>
      ),
      width: 100,
      fixed: "right",
      align: "center",
    },
  ];

  return (
    <div className={styles.pronunciationsContainer}>
      <span className={clsx([styles.title, "txt---600-14-22-bold"])}>
        <FormattedMessage id="common.pronunciations" />
      </span>
      <Row gutter={[8, 0]}>
        <Col span={9}>
          <Tooltip
            title={<FormattedMessage id="words-management.select-pos" />}
          >
            <Select
              allowClear
              variant="filled"
              placeholder={intl.formatMessage({
                id: "words-management.select-pos",
              })}
              onChange={(val) => handleChangePronunciation({ pos: val })}
              options={partOfSpeeches.map((pos) => ({
                value: pos,
                label: _.capitalize(pos),
              }))}
              value={_.capitalize(newPronunciation.pos) || null}
              size="middle"
              className="txt---400-14-18-regular"
              style={{ width: "100%" }}
            />
          </Tooltip>
        </Col>
        <Col span={2}>
          <Tooltip
            title={<FormattedMessage id="words-management.select-lang" />}
          >
            <Select
              allowClear
              variant="filled"
              onChange={(val) => handleChangePronunciation({ lang: val })}
              options={langs.current.map((lang) => ({
                value: lang,
                label: lang,
              }))}
              value={newPronunciation.lang || null}
              size="middle"
              className="txt---400-14-18-regular"
              style={{ width: "100%" }}
            />
          </Tooltip>
        </Col>
        <Col span={4}>
          <Tooltip
            title={<FormattedMessage id="words-management.upload-pron-file" />}
          >
            <Upload
              showUploadList={newPronunciation.audio ? true : false}
              maxCount={1}
              beforeUpload={beforeUploadAudioFile}
              onRemove={() => handleChangePronunciation({ audio: null })}
            >
              <Button
                icon={<UploadOutlined />}
                className="txt---400-14-18-regular"
              >
                <FormattedMessage id="words-management.pronounce" />
              </Button>
            </Upload>
          </Tooltip>
        </Col>
        <Col span={7}>
          <Input
            placeholder="Enter a pronounce of word"
            size="large"
            className="txt---400-14-18-regular"
            variant="filled"
            value={newPronunciation.pron || ""}
            onChange={(e) =>
              handleChangePronunciation({ pron: e.target.value })
            }
          />
        </Col>
        <Col span={1}>
          <Button
            type="primary"
            size="middle"
            shape="round"
            disabled={
              !Object.keys(
                _.omit(newPronunciation, ["urlId", "url", "audio"])
              ).every(
                (key: string) =>
                  newPronunciation[key as keyof Pronunciation] &&
                  (
                    newPronunciation[key as keyof Pronunciation] as string
                  ).trim() !== ""
              ) || confirmLoading
            }
            onClick={handleUpdatePronunciation}
          >
            <div className={styles.iconAddWrapper}>
              {newPronunciation._id.includes("new-") ? (
                <AiFillPlusCircle />
              ) : (
                <MdOpenInNew />
              )}
            </div>
          </Button>
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={pronunciations}
            pagination={false}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Pronunciations;
