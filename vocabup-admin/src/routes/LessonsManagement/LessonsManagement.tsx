import React, { useRef, useState } from "react";

import styles from "./LessonsManagement.module.scss";
import {
  Lesson,
  MatchingQuizz,
  OrderingQuizz,
  Quizz,
  SingleChoiceQuizz,
} from "../../types/stage";
import { Button, Popconfirm, Table, TableProps, Tooltip } from "antd";
import { IoReturnUpBack } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageType, Path } from "../../constants";
import TextEllipsis from "../../components/TextEllipsis";
import moment from "moment";
import clsx from "clsx";
import { FaPenToSquare } from "react-icons/fa6";
import { AiOutlineDelete } from "react-icons/ai";
import ActionLessonModal from "../../components/Modal/ActionLessonModal/ActionLessonModal";
import { useReduxDispatch } from "../../hooks";
import { callMessage, loadingFullScreen } from "../../redux/slice";
import { StageService } from "../../service";
import { TbPencilPlus } from "react-icons/tb";
import { FormattedMessage, useIntl } from "react-intl";

const LessonsManagement: React.FC = () => {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useReduxDispatch();

  const currentStageId = useRef(location.state.stage._id);
  const [lessons, setLessons] = useState<Lesson[]>(
    location.state.stage.lessons
  );
  const [currentLesson, setCurrentLesson] = useState<Lesson>({} as Lesson);
  const intl = useIntl();

  const [toggleLessonModal, setToggleLessonModal] = useState<boolean>(false);

  const loadLessonQuizzes = async (lesson: Lesson) => {
    dispatch(loadingFullScreen(true));
    const { data: response, status } = await StageService.getLessonQuizzes(
      lesson.quizzes as string[]
    );

    if (status < 400) {
      setCurrentLesson({
        ...lesson,
        quizzes: response.data.questions,
      });

      setToggleLessonModal(true);
    }

    dispatch(loadingFullScreen(false));
  };

  const columns: TableProps<Lesson>["columns"] = [
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="lessons-management.lesson-id" />
        </span>
      ),
      dataIndex: "_id",
      key: "_id",
      align: "center",
      width: "15%",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.title" />
        </span>
      ),
      dataIndex: "title",
      key: "title",
      width: "15%",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.desc" />
        </span>
      ),
      dataIndex: "description",
      key: "description",
      render: (description) =>
        description || (
          <i title={intl.formatMessage({ id: "common.no-desc" })}>
            <FormattedMessage id="common.no-desc" />
          </i>
        ),
      width: "10%",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="lessons-management.new-words" />
        </span>
      ),
      dataIndex: "newWords",
      key: "newWords",
      render: (words) => {
        const allNewWords = words.reduce(
          (wordsArr: string[], word: { [key: string]: string }) => {
            return [...wordsArr, word.word];
          },
          []
        );
        return (
          <TextEllipsis
            texts={allNewWords}
            amount={2}
            placement="bottomRight"
            arrow={false}
          />
        );
      },
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="lessons-management.quizzes" />
        </span>
      ),
      dataIndex: "quizzes",
      key: "quizzes",
      render: (quizzes) => quizzes.length || 0,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.updated-date" />
        </span>
      ),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => moment(updatedAt).format("DD/MM/YYYY"),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.creation-date" />
        </span>
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => moment(createdAt).format("DD/MM/YYYY"),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.actions" />
        </span>
      ),
      key: "actions",
      align: "center",
      render: (record) => (
        <div className={styles.actionsContainer}>
          <button
            className={clsx([styles.btnAction, styles.update])}
            onClick={() => loadLessonQuizzes(record)}
          >
            <FaPenToSquare />
          </button>
          <Popconfirm
            title="Delete the lesson"
            description="Are you sure to delete this lesson?"
            okText="Yes"
            cancelText="No"
            placement="topLeft"
            onConfirm={() => handleDeleteLesson(record._id)}
          >
            <button className={clsx([styles.btnAction, styles.delete])}>
              <AiOutlineDelete />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleToggleLessonModal = () => {
    setToggleLessonModal((prev) => !prev);
  };

  const handleAddQuizzToLesson = async (
    lessonId: string,
    lessonQuestionInfo: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz,
    preCb: () => void,
    successCb: (data: Lesson) => void,
    failCb: () => void
  ) => {
    preCb();
    const { data: response, status } = await StageService.addQuizzToLesson(
      lessonId,
      lessonQuestionInfo
    );

    if (status < 400) {
      const updatedLesson = response.data.lesson;
      const newQuizz = response.data.newQuizz;
      setCurrentLesson((prev) => ({
        ...prev,
        quizzes: [...(prev.quizzes || []), newQuizz],
      }));
      setLessons((prev) =>
        prev.map((lesson) => {
          if (lesson._id !== updatedLesson._id) return lesson;
          return updatedLesson;
        })
      );

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );

      successCb(updatedLesson);
    } else {
      failCb();
    }
  };

  const handleUpdateQuizzToLesson = async (
    lessonQuestionInfo: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz,
    preCb: () => void,
    successCb: (data: Lesson) => void,
    failCb: () => void
  ) => {
    preCb();
    const { data: response, status } = await StageService.updateQuizz(
      lessonQuestionInfo
    );

    if (status < 400) {
      const updatedLessonQuestion = response.data.lessonQuestion;
      setCurrentLesson((prev) => ({
        ...prev,
        quizzes: ((prev.quizzes || []) as Quizz[]).map((quizz: Quizz) => {
          if (quizz._id !== updatedLessonQuestion._id) return quizz;
          return updatedLessonQuestion;
        }),
      }));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );

      successCb(updatedLessonQuestion);
    } else {
      failCb();
    }
  };

  const handleDeleteQuizz = async (
    stageId: string,
    lessonId: string,
    quizzId: string,
    preCb?: () => void,
    successCb?: (quizzId: string) => void,
    failCb?: () => void
  ) => {
    if (typeof preCb === "function") preCb();
    const { data: response, status } = await StageService.deleteQuizz(
      stageId,
      lessonId,
      quizzId
    );

    if (status < 400) {
      if (typeof successCb === "function") successCb(quizzId);
      setCurrentLesson((prev) => ({
        ...prev,
        quizzes: ((prev.quizzes || []) as Quizz[]).filter(
          (quizz: Quizz) => quizz._id !== quizzId
        ) as unknown as string[],
      }));
      setLessons((prev) =>
        prev.map((lesson) => {
          if (lesson._id !== currentLesson._id) return lesson;
          return {
            ...lesson,
            quizzes: ((lesson.quizzes || []) as string[]).filter(
              (id: string) => id !== quizzId
            ),
          };
        })
      );

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    } else {
      if (typeof failCb === "function") failCb();
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const { data: response, status } = await StageService.deleteLesson(
      currentStageId.current,
      lessonId
    );

    if (status < 400) {
      setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
  };

  const handleAddLesson = async (
    lesson: Partial<Lesson>,
    preCb?: () => void,
    successCb?: (data: { [key: string]: string }) => void,
    failCb?: () => void
  ) => {
    if (typeof preCb === "function") preCb();
    const { data: response, status } = await StageService.addLessonToStage(
      currentStageId.current,
      lesson
    );

    if (status < 400) {
      setLessons(response.data.stage.lessons);
      setCurrentLesson({} as Lesson);
      handleToggleLessonModal();
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      if (typeof successCb === "function") successCb(response);
    } else {
      if (typeof failCb === "function") failCb();
    }
  };

  const handleUpdateLesson = async (
    lesson: Partial<Lesson>,
    preCb?: () => void,
    successCb?: (data: { [key: string]: string }) => void,
    failCb?: () => void
  ) => {
    if (typeof preCb === "function") preCb();
    const { data: response, status } = await StageService.updateLesson(
      currentStageId.current,
      lesson
    );

    if (status < 400) {
      setLessons(response.data.stage.lessons);
      setCurrentLesson({} as Lesson);
      handleToggleLessonModal();
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      if (typeof successCb === "function") successCb(response);
    } else {
      if (typeof failCb === "function") failCb();
    }
  };

  return (
    <div className={styles.lessonsManagementContainer}>
      <Table<Lesson>
        columns={columns}
        dataSource={lessons}
        title={() => (
          <div className={styles.tableHeaderContainer}>
            <div
              className={styles.backIcon}
              onClick={() => nav(Path.STAGES_MANAGEMENT)}
            >
              <IoReturnUpBack />
            </div>
            <div className={styles.actionBtns} onClick={() => {}}>
              <Tooltip
                title={<FormattedMessage id="lessons-management.add-lesson" />}
                placement="topRight"
              >
                <Button
                  icon={<TbPencilPlus />}
                  shape="circle"
                  onClick={() => {
                    handleToggleLessonModal();
                    setCurrentLesson({
                      _id: `new-${Date.now()}`,
                    } as Lesson);
                  }}
                />
              </Tooltip>
            </div>
          </div>
        )}
        size="small"
        rowKey="_id"
        rowSelection={{
          type: "checkbox",
        }}
        pagination={false}
      />
      {currentLesson && (
        <ActionLessonModal
          modalStatus={toggleLessonModal}
          onCancel={handleToggleLessonModal}
          stageLessons={lessons}
          lesson={currentLesson}
          onAddQuizz={handleAddQuizzToLesson}
          onAddLesson={handleAddLesson}
          onUpdateLesson={handleUpdateLesson}
          onUpdateQuizz={handleUpdateQuizzToLesson}
          onDeleteQuizz={(
            lessonId: string,
            lessonQuestionId: string,
            preCb?: () => void,
            successCb?: (quizzId: string) => void,
            failCb?: () => void
          ) =>
            handleDeleteQuizz(
              currentStageId.current,
              lessonId,
              lessonQuestionId,
              preCb,
              successCb,
              failCb
            )
          }
        />
      )}
    </div>
  );
};

export default LessonsManagement;
