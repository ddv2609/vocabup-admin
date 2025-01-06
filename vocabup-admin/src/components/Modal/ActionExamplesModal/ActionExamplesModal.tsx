import React, { useEffect } from "react";
import { Button, Col, Modal, Row, Table, TableProps, Tooltip } from "antd";
import { Example } from "../../../types";

import styles from "./ActionExamplesModal.module.scss";
import TextArea from "antd/es/input/TextArea";
import { AiFillPlusCircle, AiOutlineDelete } from "react-icons/ai";
import clsx from "clsx";
import { MdOpenInNew } from "react-icons/md";
import { FormattedMessage } from "react-intl";

type ActionExamplesModalProps = {
  examples: Example[];
  newExample: Example;
  setNewExample: React.Dispatch<React.SetStateAction<Example>>;
  modalStatus: boolean;
  onCancelModal: () => void;
  handleDeleteExample: (eid: string) => void;
  handleUpdateExample: () => void;
  handleRegainExample: (eid: string) => void;
  handleResetNewExample: () => void;
  handleUpdateDefinitionExamples: () => Promise<void>;
};

const ActionExamplesModal: React.FC<ActionExamplesModalProps> = ({
  examples,
  modalStatus,
  onCancelModal,
  handleDeleteExample,
  newExample,
  setNewExample,
  handleRegainExample,
  handleResetNewExample,
  handleUpdateExample,
  handleUpdateDefinitionExamples,
}) => {
  const handleChangeExample = (example: Example) => {
    if (!newExample._id.includes("new-")) {
      handleRegainExample(newExample._id);
    }
    handleDeleteExample(example._id);
    setNewExample((prev) => ({ ...prev, ...example }));
  };

  const handleChangeNewExample = (obj: Partial<Example>) => {
    setNewExample((prev) => ({
      ...prev,
      ...obj,
    }));
  };

  useEffect(() => {
    return () => handleResetNewExample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableProps<Example>["columns"] = [
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.example" />
        </span>
      ),
      dataIndex: "text",
      key: "text",
      render: (text) => <span className="txt---400-14-18-regular">{text}</span>,
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
      ellipsis: true,
    },
    {
      key: "action",
      render: (record: Example) => (
        <div className={styles.actionsContainer}>
          <Tooltip title={<FormattedMessage id="common.delete" />}>
            <button
              className={clsx([styles.btnAction, styles.delete])}
              onClick={() => handleDeleteExample(record._id)}
            >
              <AiOutlineDelete />
            </button>
          </Tooltip>
          <Tooltip title={<FormattedMessage id="common.update" />}>
            <button
              className={clsx([styles.btnAction, styles.update])}
              onClick={() => handleChangeExample(record)}
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
    <Modal
      open={modalStatus}
      centered
      maskClosable={false}
      style={{
        minWidth: "848px",
      }}
      title={
        <span className="txt---600-16-20-bold">
          <FormattedMessage id="common.examples" />
        </span>
      }
      okText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage id="common.update" />
        </span>
      }
      cancelText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage id="common.cancel" />
        </span>
      }
      onCancel={onCancelModal}
      onOk={async () => {
        await handleUpdateDefinitionExamples();
        onCancelModal();
      }}
    >
      <div className={styles.examplesContainer}>
        <Row gutter={[8, 8]} align="middle">
          <Col span={11}>
            <TextArea
              placeholder="Enter the content of the example"
              size="large"
              className="txt---400-14-18-regular"
              variant="filled"
              autoSize={{
                minRows: 2,
                maxRows: 2,
              }}
              onChange={(e) => handleChangeNewExample({ text: e.target.value })}
              value={newExample.text}
            />
          </Col>
          <Col span={11}>
            <TextArea
              placeholder="Enter the translation of the example"
              size="large"
              className="txt---400-14-18-regular"
              variant="filled"
              autoSize={{
                minRows: 2,
                maxRows: 2,
              }}
              onChange={(e) =>
                handleChangeNewExample({ translation: e.target.value })
              }
              value={newExample.translation}
            />
          </Col>
          <Col span={2}>
            <Button
              type="primary"
              size="middle"
              shape="round"
              disabled={
                !Object.keys(newExample).every(
                  (key: string) =>
                    newExample[key as keyof Example] &&
                    newExample[key as keyof Example]?.trim() !== ""
                )
              }
              onClick={handleUpdateExample}
            >
              <div className={styles.iconAddWrapper}>
                <AiFillPlusCircle />
              </div>
            </Button>
          </Col>
          <Col span={24}>
            <Table
              scroll={{ y: 420 }}
              columns={columns}
              dataSource={examples}
              pagination={false}
            />
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default ActionExamplesModal;
