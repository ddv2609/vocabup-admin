import React, { useState } from "react";

import styles from "./Definitions.module.scss";
import clsx from "clsx";
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
} from "antd";
import _ from "lodash";
import TextArea from "antd/es/input/TextArea";
import { AiFillPlusCircle, AiOutlineDelete } from "react-icons/ai";
import { Definition, Example } from "../../types";
import { CiViewList } from "react-icons/ci";
import ActionExamplesModal from "../Modal/ActionExamplesModal/ActionExamplesModal";
import { useReduxSelector } from "../../hooks";
import { MdOpenInNew } from "react-icons/md";
import { FormattedMessage } from "react-intl";

const generateId = () => `new-${Math.random().toString(36)}-${Date.now()}`;

type DefinitionsProps = {
  newDefinition: Definition;
  setNewDefinition: React.Dispatch<React.SetStateAction<Definition>>;
  newExample: Example;
  setNewExample: React.Dispatch<React.SetStateAction<Example>>;
  partOfSpeeches: string[];
  definitions: Definition[] | undefined;
  confirmLoading: boolean;
  handleResetNewExample: () => void;
  handleUpdateDefinition: () => Promise<void>;
  handleDeleteDefinition: (defId: string) => Promise<void>;
  handleRemoveTemp: (defId: string) => void;
  handleRegainDef: (defId: string) => void;
  handleUpdateDefinitionExamples: (
    selectedDefinition: Definition
  ) => Promise<void>;
};

const Definitions: React.FC<DefinitionsProps> = ({
  partOfSpeeches,
  definitions,
  newDefinition,
  setNewDefinition,
  newExample,
  setNewExample,
  confirmLoading,
  handleResetNewExample,
  handleUpdateDefinition,
  handleDeleteDefinition,
  handleRegainDef,
  handleRemoveTemp,
  handleUpdateDefinitionExamples,
}) => {
  const currentWord = useReduxSelector((state) => state.word.currentWord);
  const [toggleExamplesModal, setToggleExamplesModal] =
    useState<boolean>(false);
  const [selectedDefinition, setSelectedDefintion] = useState<Definition>();

  const handleChangeDefinition = (obj: Partial<Definition>) => {
    setNewDefinition((prev) => ({
      ...prev,
      ...obj,
    }));
  };

  const handleUpdateDef = (obj: Definition) => {
    if (!newDefinition._id.includes("new")) {
      handleRegainDef(newDefinition._id);
    }
    setNewDefinition((prev) => ({
      ...prev,
      ...obj,
    }));
    handleRemoveTemp(obj._id);
  };

  const handleOpenExamplesModal = (def: Definition) => {
    setToggleExamplesModal(true);
    setSelectedDefintion(def);
  };

  const handleCancelExamplesModal = () => setToggleExamplesModal(false);

  const handleDeleteExample = (eid: string) => {
    setSelectedDefintion((prev) => ({
      ...prev!,
      example: prev!.example!.filter((examp) => examp._id !== eid),
    }));
  };

  const handleRegainExample = (eid: string) => {
    const removedExample = currentWord?.definition
      .find((defin) => defin._id === selectedDefinition?._id)!
      .example.find((example) => example._id === eid);
    if (removedExample) {
      setSelectedDefintion((prev) => ({
        ...prev!,
        example: [...prev!.example, removedExample],
      }));
    }
  };

  const handleUpdateExample = () => {
    setSelectedDefintion((prev) => ({
      ...prev!,
      example: [...prev!.example, newExample],
    }));
    setNewExample({
      _id: generateId(),
      text: "",
      translation: "",
    });
  };

  const columns: TableProps<Definition>["columns"] = [
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
          <FormattedMessage id="common.source" />
        </span>
      ),
      dataIndex: "source",
      key: "source",
      render: (source) => (
        <span className={clsx(["txt---400-14-18-regular", styles.source])}>
          {source}
        </span>
      ),
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.definition" />
        </span>
      ),
      dataIndex: "text",
      key: "text",
      render: (text) => <span className="txt---400-14-18-regular">{text}</span>,
      // width: "30%",
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
      // width: "30%",
      ellipsis: true,
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.contextual-meaning" />
        </span>
      ),
      dataIndex: "contextualMeaning",
      key: "contextualMeaning",
      render: (contextualMeaning) => (
        <span className="txt---400-14-18-regular">{contextualMeaning}</span>
      ),
      // width: "30%",
      // ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.examples" />
        </span>
      ),
      key: "examples",
      render: (record: Definition) => (
        <div className={styles.examplesViewConatiner}>
          <Tooltip
            title={<FormattedMessage id="words-management.view-all-examples" />}
          >
            <button
              className={clsx([styles.btnAction, styles.viewAllExamples])}
              onClick={() => handleOpenExamplesModal(record)}
            >
              <CiViewList />
            </button>
          </Tooltip>
        </div>
      ),
      width: 100,
      fixed: "right",
      align: "center",
    },
    {
      key: "action",
      render: (record: Definition) => (
        <div className={styles.actionsContainer}>
          <Tooltip title={<FormattedMessage id="common.delete" />}>
            <Popconfirm
              title={<FormattedMessage id="words-management.confirm-delete" />}
              description={
                <FormattedMessage id="words-management.confirm-delete-def" />
              }
              onConfirm={async () => {
                await handleDeleteDefinition(record._id);
                return Promise.resolve();
              }}
            >
              <button className={clsx([styles.btnAction, styles.delete])}>
                <AiOutlineDelete />
              </button>
            </Popconfirm>
          </Tooltip>
          <Tooltip title={<FormattedMessage id="common.update" />}>
            <button
              className={clsx([styles.btnAction, styles.update])}
              disabled={confirmLoading}
              onClick={() => handleUpdateDef(record)}
            >
              <MdOpenInNew />
            </button>
          </Tooltip>
        </div>
      ),
      width: "10%",
      fixed: "right",
      align: "center",
    },
  ];

  return (
    <div className={styles.definitionsContainer}>
      <span className={clsx([styles.title, "txt---600-14-22-bold"])}>
        <FormattedMessage id="common.definitions" />
      </span>
      <Row gutter={[8, 8]}>
        <Col span={8}>
          <Select
            allowClear
            placeholder="Select a part of speech"
            onChange={(val) => handleChangeDefinition({ pos: val })}
            options={partOfSpeeches.map((pos) => ({
              value: pos,
              label: _.capitalize(pos),
            }))}
            value={_.capitalize(newDefinition.pos) || null}
            size="middle"
            variant="filled"
            className="txt---400-14-18-regular"
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Source of definition"
            size="large"
            className="txt---400-14-18-regular"
            variant="filled"
            value={newDefinition.source || ""}
            onChange={(e) => handleChangeDefinition({ source: e.target.value })}
          />
        </Col>
        <Col span={8}>
          <Input
            placeholder="Meaning in context"
            size="large"
            className="txt---400-14-18-regular"
            variant="filled"
            value={newDefinition.contextualMeaning || ""}
            onChange={(e) =>
              handleChangeDefinition({ contextualMeaning: e.target.value })
            }
          />
        </Col>
        <Col span={2}>
          <Button
            type="primary"
            size="middle"
            shape="round"
            disabled={
              !Object.keys(_.omit(newDefinition, ["example"])).every(
                (key: string) =>
                  newDefinition[key as keyof Definition] &&
                  (newDefinition[key as keyof Definition] as string) !== ""
              ) || confirmLoading
            }
            onClick={handleUpdateDefinition}
          >
            <div className={styles.iconAddWrapper}>
              {newDefinition._id?.includes("new") ? (
                <AiFillPlusCircle />
              ) : (
                <MdOpenInNew />
              )}
            </div>
          </Button>
        </Col>
        <Col span={12}>
          <TextArea
            placeholder="Enter the definition of the word"
            size="large"
            className="txt---400-14-18-regular"
            variant="filled"
            autoSize={{
              minRows: 4,
              maxRows: 4,
            }}
            value={newDefinition.text || ""}
            onChange={(e) => handleChangeDefinition({ text: e.target.value })}
          />
        </Col>
        <Col span={12}>
          <TextArea
            placeholder="Enter the translation of the word"
            size="large"
            className="txt---400-14-18-regular"
            variant="filled"
            autoSize={{
              minRows: 4,
              maxRows: 4,
            }}
            value={newDefinition.translation || ""}
            onChange={(e) =>
              handleChangeDefinition({ translation: e.target.value })
            }
          />
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={definitions}
            pagination={false}
          />
        </Col>
      </Row>
      {toggleExamplesModal && (
        <ActionExamplesModal
          examples={selectedDefinition?.example || []}
          newExample={newExample}
          setNewExample={setNewExample}
          modalStatus={toggleExamplesModal}
          onCancelModal={handleCancelExamplesModal}
          handleDeleteExample={handleDeleteExample}
          handleUpdateExample={handleUpdateExample}
          handleRegainExample={handleRegainExample}
          handleResetNewExample={handleResetNewExample}
          handleUpdateDefinitionExamples={async () => {
            await handleUpdateDefinitionExamples(selectedDefinition!);
            // console.log(selectedDefinition);
            // return Promise.resolve();
          }}
        />
      )}
    </div>
  );
};

export default Definitions;
