import React, { useEffect, useState } from "react";

import styles from "./ActionLessonModal.module.scss";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  TableProps,
  Tooltip,
} from "antd";
import {
  Lesson,
  MatchingQuizz,
  OrderingQuizz,
  SingleChoiceQuizz,
} from "../../../types/stage";
import { useForm } from "antd/es/form/Form";
// import TextEllipsis from "../../TextEllipsis";
import TextArea from "antd/es/input/TextArea";
import clsx from "clsx";
import { FaPenToSquare } from "react-icons/fa6";
import { AiOutlineDelete } from "react-icons/ai";
import ActionQuizzModal from "./ActionQuizzModal";
import { TbPencilQuestion } from "react-icons/tb";
import DebounceSelect from "../../DebounceSelect";
import { WordService } from "../../../service";
import { Word } from "../../../types";

type Option = {
  value: string;
  label: string;
};

type ActionLessonModalProps = {
  modalStatus: boolean;
  lesson: Lesson;
  stageLessons: Lesson[];
  onCancel: () => void;
  onAddLesson: (
    lesson: Partial<Lesson>,
    preCb?: () => void,
    successCb?: (data: { [key: string]: string }) => void,
    failCb?: () => void
  ) => void;
  onUpdateLesson: (
    lesson: Partial<Lesson>,
    preCb?: () => void,
    successCb?: (data: { [key: string]: string }) => void,
    failCb?: () => void
  ) => void;
  onAddQuizz: (
    lessonId: string,
    lessonQuestionInfo: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz,
    preCb: () => void,
    successCb: (data: Lesson) => void,
    failCb: () => void
  ) => Promise<void>;
  onUpdateQuizz: (
    lessonQuestionInfo: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz,
    preCb: () => void,
    successCb: (data: Lesson) => void,
    failCb: () => void
  ) => Promise<void>;
  onDeleteQuizz: (
    lessonId: string,
    lessonQuestionId: string,
    preCb?: () => void,
    successCb?: (quizzId: string) => void,
    failCb?: () => void
  ) => Promise<void>;
};

const ActionLessonModal: React.FC<ActionLessonModalProps> = ({
  modalStatus,
  onCancel,
  stageLessons,
  lesson,
  onAddLesson,
  onUpdateLesson,
  onAddQuizz,
  onDeleteQuizz,
  onUpdateQuizz,
}) => {
  const [toggleQuizzModal, setToggleQuizzModal] = useState<boolean>(false);
  const [currentQuizz, setCurrentQuizz] = useState<
    MatchingQuizz | OrderingQuizz | SingleChoiceQuizz
  >();
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [_, setReloadContent] = useState<boolean>(true);
  const [lessonFrm] = useForm();

  const reloadUI = () => setReloadContent((prev) => !prev);

  const handleToggleQuizzModal = () => {
    setToggleQuizzModal((prev) => !prev);
    setCurrentQuizz({} as MatchingQuizz);
  };

  const handleActionQuizz = (
    record: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz
  ) => {
    setCurrentQuizz(record);
    setToggleQuizzModal(true);
  };

  const getTransferBody = (): Lesson => {
    const { title, previousLesson, description, newWords } =
      lessonFrm.getFieldsValue();
    return {
      title,
      previousLesson,
      description,
      newWords: newWords.map((word: Option) => word.value),
    } as Lesson;
  };

  const handleSubmitLessonToStage = async () => {
    lessonFrm.validateFields().then(() => {
      if (lesson._id.includes("new")) {
        onAddLesson(
          getTransferBody(),
          () => setLoadingStatus(true),
          () => setLoadingStatus(false),
          () => setLoadingStatus(false)
        );
      } else {
        onUpdateLesson(
          {
            ...getTransferBody(),
            _id: lesson._id,
          },
          () => setLoadingStatus(true),
          () => setLoadingStatus(false),
          () => setLoadingStatus(false)
        );
      }
    });
  };

  const loadWords = async (q: string): Promise<Option[]> => {
    return WordService.searchWords(q).then(({ data: response }) =>
      response.data.words.map((word: Word) => ({
        value: word._id,
        label: word.word,
      }))
    ) as Promise<Option[]>;
  };

  useEffect(() => {
    lessonFrm.setFieldsValue({
      title: lesson.title,
      previousLesson: lesson.previousLesson,
      description: lesson.description,
      newWords: lesson.newWords?.map((item) => ({
        label: item.word,
        value: item._id,
      })),
    });
  }, [lesson, lessonFrm]);

  const columns: TableProps<
    MatchingQuizz | OrderingQuizz | SingleChoiceQuizz
  >["columns"] = [
    {
      title: <span className="txt---600-14-18-bold">Title</span>,
      dataIndex: "title",
      key: "title",
      width: "15%",
      ellipsis: true,
    },
    {
      title: <span className="txt---600-14-18-bold">Type</span>,
      dataIndex: "type",
      key: "type",
      width: "10%",
      ellipsis: true,
    },
    {
      title: <span className="txt---600-14-18-bold">Question Text Vi</span>,
      dataIndex: "questionTextVi",
      key: "questionTextVi",
      ellipsis: true,
    },
    {
      title: <span className="txt---600-14-18-bold">Question Text En</span>,
      dataIndex: "questionTextEn",
      key: "questionTextEn",
      ellipsis: true,
    },
    {
      title: <span className="txt---600-14-18-bold">Explanation</span>,
      dataIndex: "explanation",
      key: "explanation",
      ellipsis: true,
    },
    {
      title: <span className="txt---600-14-18-bold">Type Detail</span>,
      dataIndex: "typeDetail",
      key: "typeDetail",
      ellipsis: true,
    },
    {
      title: <span className="txt---600-14-18-bold">Actions</span>,
      key: "actions",
      render: (record: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz) => (
        <div className={styles.actionsContainer}>
          <button
            className={clsx([styles.btnAction, styles.update])}
            onClick={() => handleActionQuizz(record)}
          >
            <FaPenToSquare />
          </button>
          <Popconfirm
            title="Delete the quizz"
            description="Are you sure to delete this quizz?"
            okText="Yes"
            cancelText="No"
            placement="topLeft"
            onConfirm={async () => {
              await onDeleteQuizz(
                lesson._id,
                record._id!,
                () => {},
                () => {},
                () => {}
              );

              return Promise.resolve();
            }}
          >
            <button className={clsx([styles.btnAction, styles.delete])}>
              <AiOutlineDelete />
            </button>
          </Popconfirm>
        </div>
      ),
      align: "center",
    },
  ];

  return (
    <Modal
      open={modalStatus}
      maskClosable={false}
      centered
      title={<span className="txt---600-16-20-bold">Lesson</span>}
      okText={
        <span className="txt---400-14-18-regular">
          {lesson._id?.includes("new") ? "Add" : "Update"}
        </span>
      }
      cancelText={<span className="txt---400-14-18-regular">Cancel</span>}
      onCancel={onCancel}
      onOk={() => {
        handleSubmitLessonToStage();
      }}
      style={{
        minWidth: lesson._id?.includes("new") ? "640px" : "884px",
      }}
      confirmLoading={loadingStatus}
    >
      <Form
        form={lessonFrm}
        layout="vertical"
        variant="filled"
        size="middle"
        requiredMark="optional"
        labelCol={{
          style: { paddingBottom: 0 },
        }}
      >
        <Row gutter={[12, 8]}>
          <Col span={12}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Title</span>}
              name="title"
              rules={[{ required: true, message: "Please enter a title" }]}
              tooltip="This is a required field"
            >
              <Input
                size="large"
                className="txt---400-14-18-regular"
                placeholder="Enter a title"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span className="txt---600-14-18-bold">Previous Lesson</span>
              }
              name="previousLesson"
              tooltip="This is a optional field"
            >
              <Select
                size="middle"
                options={stageLessons
                  .filter(
                    (item: Lesson) =>
                      item._id !== lesson._id &&
                      item.previousLesson !== lesson._id
                  )
                  .map((lesson: Lesson) => ({
                    value: lesson._id,
                    label: lesson.title,
                  }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">New Words</span>}
              name="newWords"
              tooltip="This is a optional field"
            >
              {/* <TextEllipsis
                texts={(lesson!.newWords || []).map((word) => word.word)}
                amount={5}
                arrow={false}
                placement="bottomRight"
              /> */}
              <DebounceSelect
                mode="multiple"
                fetchOptions={loadWords}
                debounceTimeout={800}
                value={lessonFrm.getFieldValue("newWords")}
                onChange={(value: Option[]) => {
                  lessonFrm.setFieldValue(
                    "newWords",
                    value.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))
                  );
                  reloadUI();
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Description</span>}
              name="description"
              tooltip="This is a optional field"
            >
              <TextArea
                placeholder="Enter the description of the quizz"
                size="large"
                className="txt---400-14-18-regular"
                variant="filled"
                autoSize={{
                  minRows: 4,
                  maxRows: 4,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {!lesson._id?.includes("new") && (
        <>
          <hr />
          <div className={styles.quizzesListContainer}>
            <Table
              title={() => (
                <div className={styles.tableHeaderContainer}>
                  <h3
                    className={clsx([
                      "txt---400-16-20-regular",
                      styles.heading,
                    ])}
                  >
                    List Of Quizzes
                  </h3>
                  <Space className={styles.actions}>
                    <Tooltip title="Add quizz" placement="topRight">
                      <Button
                        icon={<TbPencilQuestion />}
                        shape="circle"
                        onClick={() => {
                          handleToggleQuizzModal();
                          setCurrentQuizz({} as MatchingQuizz);
                        }}
                      />
                    </Tooltip>
                  </Space>
                </div>
              )}
              columns={
                columns as (MatchingQuizz | OrderingQuizz | SingleChoiceQuizz)[]
              }
              dataSource={
                (lesson.quizzes as (
                  | MatchingQuizz
                  | OrderingQuizz
                  | SingleChoiceQuizz
                )[]) || []
              }
              style={{ width: "100%" }}
              size="small"
              pagination={false}
            />
          </div>
        </>
      )}
      <>
        <ActionQuizzModal
          key={currentQuizz?._id || Date.now()}
          modalStatus={toggleQuizzModal}
          onCancle={handleToggleQuizzModal}
          currentQuizz={currentQuizz}
          onChangeCurrentQuizz={setCurrentQuizz}
          onAddQuizz={(
            lessonQuestionInfo:
              | MatchingQuizz
              | OrderingQuizz
              | SingleChoiceQuizz,
            preCb: () => void,
            successCb: (data: Lesson) => void,
            failCb: () => void
          ) =>
            onAddQuizz(lesson._id, lessonQuestionInfo, preCb, successCb, failCb)
          }
          onUpdateQuizz={(
            lessonQuestionInfo:
              | MatchingQuizz
              | OrderingQuizz
              | SingleChoiceQuizz,
            preCb: () => void,
            successCb: (data: Lesson) => void,
            failCb: () => void
          ) => onUpdateQuizz(lessonQuestionInfo, preCb, successCb, failCb)}
          onDeleteQuizz={(
            lessonQuestionId: string,
            preCb: () => void,
            successCb: (quizzId: string) => void,
            failCb: () => void
          ) =>
            onDeleteQuizz(
              lesson._id,
              lessonQuestionId,
              preCb,
              successCb,
              failCb
            )
          }
        />
      </>
    </Modal>
  );
};

export default ActionLessonModal;
