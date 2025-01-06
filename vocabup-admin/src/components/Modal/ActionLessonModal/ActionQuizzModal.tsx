import React, { useEffect, useState } from "react";
import {
  PartOfSpeeches,
  QUIZZ_TYPES,
  Variations,
  VerbForms,
} from "../../../constants";
import {
  Button,
  Cascader,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
} from "antd";
import { useForm } from "antd/es/form/Form";
import {
  Lesson,
  MatchingQuizz,
  OrderingItem,
  OrderingQuizz,
  Quizz,
  SingleChoiceQuizz,
} from "../../../types/stage";
import TextArea from "antd/es/input/TextArea";
import DebounceSelect from "../../DebounceSelect";
import { WordService } from "../../../service";
import { Word } from "../../../types";
import { capitalize, merge, omit } from "lodash";
import { PlusOutlined } from "@ant-design/icons";
import OrderingItemsTable from "./OrderingItemsTable";
import { FaPenToSquare } from "react-icons/fa6";

// import styles from "./ActionQuizzModal.module.scss";

const quizzTypeOptions = [
  {
    value: "SINGLE_CHOICE_QUESTION",
    label: QUIZZ_TYPES["SINGLE_CHOICE_QUESTION"],
    children: [
      {
        value: "IMAGE_SELECTION_QUIZZ",
        label: QUIZZ_TYPES["IMAGE_SELECTION_QUIZZ"],
      },
      {
        value: "TEXT_SELECTION_QUIZZ",
        label: QUIZZ_TYPES["TEXT_SELECTION_QUIZZ"],
      },
      {
        value: "LISTENING_SELECTION_QUIZZ",
        label: QUIZZ_TYPES["LISTENING_SELECTION_QUIZZ"],
      },
    ],
  },
  {
    value: "ORDERING_QUESTION",
    label: QUIZZ_TYPES["ORDERING_QUESTION"],
    children: [
      {
        value: "SORT_SENTENCE_EN-VI",
        label: QUIZZ_TYPES["SORT_SENTENCE_EN"],
      },
      {
        value: "SORT_SENTENCE_VI-EN",
        label: QUIZZ_TYPES["SORT_SENTENCE_VI"],
      },
    ],
  },
  {
    value: "MATCHING_QUESTION",
    label: QUIZZ_TYPES["MATCHING_QUESTION"],
    children: [
      {
        value: "PAIR_QUIZZ",
        label: QUIZZ_TYPES["PAIR_QUIZZ"],
      },
    ],
  },
];

type ActionQuizzModalProps = {
  modalStatus: boolean;
  onCancle: () => void;
  currentQuizz: MatchingQuizz | OrderingQuizz | SingleChoiceQuizz | undefined;
  onChangeCurrentQuizz: React.Dispatch<
    React.SetStateAction<
      MatchingQuizz | OrderingQuizz | SingleChoiceQuizz | undefined
    >
  >;
  onAddQuizz: (
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
    lessonQuestionId: string,
    preCb: () => void,
    successCb: (quizzId: string) => void,
    failCb: () => void
  ) => Promise<void>;
};

type Option = {
  value: string;
  label: string;
};

const ActionQuizzModal: React.FC<ActionQuizzModalProps> = ({
  modalStatus,
  onCancle,
  currentQuizz,
  onAddQuizz,
  onUpdateQuizz,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setReloadContent] = useState<boolean>(true);
  const [quizzFrm] = useForm();
  // const [submittingForm, setSubmittingForm] = useState<boolean>(false);
  const [orderingQuizzItems, setOrderingQuizzItems] = useState<OrderingItem[]>(
    (currentQuizz
      ? currentQuizz["items" as keyof Quizz] || []
      : []) as OrderingItem[]
  );

  const [currentOrderItemId, setCurrentOrderItemId] = useState<string>("");

  const reloadUI = () => setReloadContent((prev) => !prev);
  const [regainOrderItem, setRegainOrderItem] = useState<OrderingItem>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const loadWords = async (q: string): Promise<Option[]> => {
    return WordService.searchWords(q).then(({ data: response }) =>
      response.data.words.map((word: Word) => ({
        value: word._id,
        label: word.word,
      }))
    ) as Promise<Option[]>;
  };

  const handleAddOrderItem = () => {
    const { text, verbForm, variation, pos, correctPosition } =
      quizzFrm.getFieldsValue();
    setOrderingQuizzItems((prev) => [
      ...prev,
      {
        _id: currentOrderItemId || `new-${Date.now().toString()}`,
        text: {
          word: text.label,
          ...text,
        },
        verbForm,
        variation,
        pos,
        correctPosition,
      } as OrderingItem,
    ]);

    quizzFrm.resetFields([
      "text",
      "verbForm",
      "variation",
      "pos",
      "correctPosition",
    ]);

    setCurrentOrderItemId("");
    setRegainOrderItem(undefined);
  };

  const handleChangeOrderItem = (item: OrderingItem) => {
    quizzFrm.setFieldsValue({
      text: {
        value: item.text._id || item.text["value" as keyof Word],
        label: item.text.word,
      },
      verbForm: item?.verbForm,
      variation: item?.variation,
      pos: item?.pos,
      correctPosition: item?.correctPosition,
    });
    setOrderingQuizzItems((prev) => {
      const newItems = prev.filter((oi) => oi._id !== item._id);
      return regainOrderItem ? [...newItems, regainOrderItem] : newItems;
    });
    setRegainOrderItem(item);
    setCurrentOrderItemId(item._id);
  };

  const getTransferBody = () => {
    const { title, quizzType, questionTextEn, questionTextVi, explanation } =
      quizzFrm.getFieldsValue();

    const transferBody = {
      title,
      type: quizzType[0],
      typeDetail: quizzType[1],
      questionTextEn,
      questionTextVi,
      explanation,
    };

    if (currentQuizz?._id) merge(transferBody, { _id: currentQuizz._id });

    switch (quizzType[0]) {
      case "SINGLE_CHOICE_QUESTION":
        merge(transferBody, {
          options: quizzFrm
            .getFieldValue("options")
            .map((option: Option) => option.value),
          correctAnswerIndex: quizzFrm.getFieldValue("correctAnswerIndex"),
        });
        break;
      case "ORDERING_QUESTION":
        merge(transferBody, {
          items: orderingQuizzItems.map((item: OrderingItem) => ({
            ...omit(item, item._id.includes("new") ? ["_id"] : []),
            text: item.text._id || item.text["value" as keyof Word],
          })),
        });
        break;
      case "MATCHING_QUESTION":
        merge(transferBody, {
          pairs: quizzFrm
            .getFieldValue("pairs")
            .map((pair: Option) => pair.value),
          correctAnswerIndex: quizzFrm.getFieldValue("correctAnswerIndex"),
        });
        break;
      default:
        break;
    }

    return transferBody;
  };

  const handleAddQuizz = async () => {
    quizzFrm.validateFields().then(() => {
      onAddQuizz(
        getTransferBody() as MatchingQuizz | OrderingQuizz | SingleChoiceQuizz,
        () => setConfirmLoading(true),
        () => {
          setConfirmLoading(false);
          onCancle();
        },
        () => setConfirmLoading(false)
      );
    });
  };

  const handleUpdateQuizz = async () => {
    quizzFrm.validateFields().then(() => {
      onUpdateQuizz(
        getTransferBody() as MatchingQuizz | OrderingQuizz | SingleChoiceQuizz,
        () => setConfirmLoading(true),
        () => {
          setConfirmLoading(false);
          onCancle();
        },
        () => setConfirmLoading(false)
      );
    });
  };

  useEffect(() => {
    quizzFrm.setFieldsValue({
      quizzType: currentQuizz?._id
        ? [currentQuizz?.type, currentQuizz?.typeDetail]
        : [],
      title: currentQuizz?.title,
      questionTextVi: currentQuizz?.questionTextVi,
      questionTextEn: currentQuizz?.questionTextEn,
      explanation: currentQuizz?.explanation,
      pairs: currentQuizz
        ? ((currentQuizz["pairs" as keyof Quizz] || []) as Partial<Word>[]).map(
            (item: Partial<Word>) => ({
              value: item._id,
              label: item.word,
            })
          )
        : [],
      options: currentQuizz
        ? (
            (currentQuizz["options" as keyof Quizz] || []) as Partial<Word>[]
          ).map((item: Partial<Word>) => ({
            value: item._id,
            label: item.word,
          }))
        : [],
      correctAnswerIndex: currentQuizz
        ? currentQuizz["correctAnswerIndex" as keyof Quizz]
        : null,
      correctPosition: -1,
    });

    setCurrentOrderItemId("");
    reloadUI();
  }, [currentQuizz, quizzFrm]);
  return (
    <Modal
      open={modalStatus}
      maskClosable={false}
      centered
      title={<span className="txt---600-16-20-bold">Quizz</span>}
      okText={
        <span className="txt---400-14-18-regular">
          {currentQuizz?._id ? "Update" : "Add"}
        </span>
      }
      cancelText={<span className="txt---400-14-18-regular">Cancel</span>}
      onCancel={onCancle}
      onOk={() => {
        if (!currentQuizz?._id) handleAddQuizz();
        else handleUpdateQuizz();
      }}
      okButtonProps={{
        disabled: !quizzFrm.getFieldValue("quizzType")?.length,
      }}
      style={{
        minWidth: "720px",
        maxHeight: "480px",
      }}
      confirmLoading={confirmLoading}
    >
      <Form
        form={quizzFrm}
        layout="vertical"
        variant="filled"
        size="middle"
        requiredMark="optional"
        labelCol={{
          style: { paddingBottom: 0 },
        }}
      >
        <Row
          gutter={[12, 8]}
          align="bottom"
          style={{
            maxHeight: "420px",
            overflowY: "auto",
          }}
        >
          <Col span={10}>
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
          <Col span={14}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Quizz Type</span>}
              name="quizzType"
              rules={[{ required: true, message: "Please select a type" }]}
              tooltip="This is a required field"
            >
              <Cascader
                options={quizzTypeOptions}
                size="middle"
                onChange={(options: string[]) => {
                  quizzFrm.setFieldValue("quizzType", options);
                  reloadUI();
                }}
                allowClear
                disabled={!!currentQuizz?.type}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span className="txt---600-14-18-bold">
                  Question Text VietNamese
                </span>
              }
              name="questionTextVi"
              tooltip="This is a optional field"
            >
              <Input
                size="large"
                className="txt---400-14-18-regular"
                placeholder="Enter a quizz text"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span className="txt---600-14-18-bold">
                  Question Text English
                </span>
              }
              name="questionTextEn"
              tooltip="This is a optional field"
            >
              <Input
                size="large"
                className="txt---400-14-18-regular"
                placeholder="Enter a quizz text"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Explanation</span>}
              name="explanation"
              tooltip="This is a optional field"
            >
              <TextArea
                size="large"
                className="txt---400-14-18-regular"
                placeholder="Enter a quizz answer explanation"
                variant="filled"
                autoSize={{
                  minRows: 4,
                  maxRows: 4,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <hr />
          </Col>
          {currentQuizz?.type === "MATCHING_QUESTION" ||
          quizzFrm.getFieldValue("quizzType")?.includes("MATCHING_QUESTION") ? (
            <Col span={24}>
              <Form.Item
                label={<span className="txt---600-14-18-bold">Pairs</span>}
                name="pairs"
                rules={[
                  { required: true, message: "Please choose some words" },
                ]}
                tooltip="This is a optional field"
              >
                <DebounceSelect
                  mode="multiple"
                  fetchOptions={loadWords}
                  debounceTimeout={800}
                  value={quizzFrm.getFieldValue("pairs")}
                  onChange={(value: Option[]) => {
                    quizzFrm.setFieldValue(
                      "pairs",
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
          ) : (
            ""
          )}
          {currentQuizz?.type === "SINGLE_CHOICE_QUESTION" ||
          quizzFrm
            .getFieldValue("quizzType")
            ?.includes("SINGLE_CHOICE_QUESTION") ? (
            <>
              <Col span={16}>
                <Form.Item
                  label={<span className="txt---600-14-18-bold">Options</span>}
                  name="options"
                  rules={[{ required: true, message: "Please enter choices" }]}
                  tooltip="This is a required field"
                >
                  <DebounceSelect
                    mode="multiple"
                    fetchOptions={loadWords}
                    debounceTimeout={800}
                    value={quizzFrm.getFieldValue("options")}
                    onChange={(value: Option[]) => {
                      quizzFrm.setFieldValue(
                        "options",
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
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      Correct Answer Index
                    </span>
                  }
                  name="correctAnswerIndex"
                  rules={[
                    {
                      required: true,
                      message: "Please enter correct answer index",
                    },
                  ]}
                  tooltip="This is a required field"
                >
                  <Select
                    options={quizzFrm
                      .getFieldValue("options")
                      ?.map((_: unknown, index: number) => ({
                        value: index,
                        label: index + 1,
                      }))}
                    value={quizzFrm.getFieldValue("correctAnswerIndex") + 1}
                    onChange={(idx: number) => {
                      quizzFrm.setFieldValue("correctAnswerIndex", idx);
                      reloadUI();
                    }}
                  />
                </Form.Item>
              </Col>
            </>
          ) : (
            ""
          )}
          {currentQuizz?.type === "ORDERING_QUESTION" ||
          quizzFrm.getFieldValue("quizzType")?.includes("ORDERING_QUESTION") ? (
            <>
              <Col span={8}>
                <Form.Item
                  label={<span className="txt---600-14-18-bold">Text</span>}
                  name="text"
                >
                  <DebounceSelect
                    mode="multiple"
                    maxCount={1}
                    fetchOptions={loadWords}
                    debounceTimeout={800}
                    value={quizzFrm.getFieldValue("text")}
                    onChange={(value: Option[]) => {
                      quizzFrm.setFieldValue(
                        "text",
                        value.map((item) => ({
                          value: item.value,
                          label: item.label,
                        }))[0]
                      );
                      reloadUI();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">Verb Form</span>
                  }
                  name="verbForm"
                >
                  <Select
                    options={VerbForms.map((frm) => ({
                      value: frm,
                      label: capitalize(frm),
                    }))}
                    onChange={(value) => {
                      quizzFrm.setFieldValue("verbForm", value);
                      reloadUI();
                    }}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">Variation</span>
                  }
                  name="variation"
                >
                  <Select
                    options={Variations.map((variation) => ({
                      value: variation,
                      label: capitalize(variation),
                    }))}
                    onChange={(value) => {
                      quizzFrm.setFieldValue("variation", value);
                      reloadUI();
                    }}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">Part Of Speech</span>
                  }
                  name="pos"
                >
                  <Select
                    options={PartOfSpeeches.map((pos) => ({
                      value: pos,
                      label: capitalize(pos),
                    }))}
                    onChange={(value) => {
                      quizzFrm.setFieldValue("pos", value);
                      reloadUI();
                    }}
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      Correct Position
                    </span>
                  }
                  name="correctPosition"
                  initialValue={-1}
                >
                  <InputNumber
                    placeholder="Enter correct position"
                    onChange={(value) => {
                      quizzFrm.setFieldValue("correctPosition", value);
                      reloadUI();
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item label={""}>
                  <Button
                    shape="round"
                    type="primary"
                    icon={
                      !currentOrderItemId ||
                      currentOrderItemId.includes("new") ? (
                        <PlusOutlined />
                      ) : (
                        <FaPenToSquare />
                      )
                    }
                    onClick={handleAddOrderItem}
                    disabled={["text", "pos"].some(
                      (item) => !quizzFrm.getFieldValue(item)
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <OrderingItemsTable
                  orderItems={orderingQuizzItems}
                  setOrderItems={setOrderingQuizzItems}
                  onChangeOrderItem={handleChangeOrderItem}
                />
              </Col>
            </>
          ) : (
            ""
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default ActionQuizzModal;
