import React, { useEffect, useState } from "react";
import { Col, DatePicker, Form, Input, InputNumber, Modal, Row } from "antd";
import { Stage } from "../../types/stage";
import { useForm } from "antd/es/form/Form";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import { FormattedMessage } from "react-intl";

type StageInfoModalProps = {
  modalStatus: boolean;
  stage: Stage;
  onCancel: () => void;
  onConfirm: (
    stage: Partial<Stage>,
    preCb: () => void,
    successCb: (data: { [key: string]: string }) => void,
    failCb: () => void
  ) => void;
};

const StageInfoModal: React.FC<StageInfoModalProps> = ({
  stage,
  modalStatus,
  onCancel,
  onConfirm,
}) => {
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [stageFrm] = useForm();

  const getTransferBody = (): Partial<Stage> => {
    const { topic, part, description } = stageFrm.getFieldsValue();

    return { topic, part, description };
  };

  useEffect(() => {
    stageFrm.setFieldsValue({
      topic: stage.topic,
      part: stage.part,
      lessons: stage?.lessons?.length,
      createdAt: dayjs(stage.createdAt),
      updatedAt: dayjs(stage.updatedAt),
      description: stage.description,
    });
  }, [stage, stageFrm]);

  return (
    <Modal
      open={modalStatus}
      maskClosable={false}
      centered
      title={
        <span className="txt---600-16-20-bold">
          <FormattedMessage id="common.stage" />
        </span>
      }
      okText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage
            id={`common.${stage._id?.includes("new") ? "add" : "update"}`}
          />
        </span>
      }
      cancelText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage id="common.cancel" />
        </span>
      }
      onCancel={onCancel}
      onOk={() => {
        stageFrm.validateFields().then(() => {
          onConfirm(
            getTransferBody(),
            () => setLoadingStatus(true),
            () => setLoadingStatus(false),
            () => setLoadingStatus(false)
          );
        });
      }}
      confirmLoading={loadingStatus}
    >
      <Form
        form={stageFrm}
        layout="vertical"
        variant="filled"
        size="large"
        requiredMark="optional"
        labelCol={{
          style: { paddingBottom: 0 },
        }}
      >
        <Row gutter={[12, 0]}>
          <Col span={24}>
            <Form.Item
              label={
                <span className="txt---600-14-18-bold">
                  <FormattedMessage id="common.topic" />
                </span>
              }
              name="topic"
              required
              rules={[{ required: true, message: "Please enter stage topic!" }]}
              tooltip="This is a required field"
            >
              <Input
                className="txt---400-14-18-regular"
                placeholder="Enter stage topic"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span className="txt---600-14-18-bold">
                  <FormattedMessage id="common.part" />
                </span>
              }
              name="part"
              required
              rules={[{ required: true, message: "Please enter stage topic!" }]}
              tooltip="This is a required field"
            >
              <InputNumber
                placeholder="Enter stage part number"
                size="middle"
                style={{
                  width: "100%",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span className="txt---600-14-18-bold">
                  <FormattedMessage id="common.lessons" />
                </span>
              }
              name="lessons"
              tooltip="This is a optional field"
            >
              <InputNumber
                size="middle"
                style={{
                  width: "100%",
                }}
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Created At</span>}
              name="createdAt"
              tooltip="This is a optional field"
            >
              <DatePicker
                size="middle"
                style={{
                  width: "100%",
                }}
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Updated At</span>}
              name="updatedAt"
              tooltip="This is a optional field"
            >
              <DatePicker
                size="middle"
                style={{
                  width: "100%",
                }}
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={<span className="txt---600-14-18-bold">Description</span>}
              name="description"
              tooltip="This is a optional field"
            >
              <TextArea
                className="txt---400-14-18-regular"
                placeholder="Enter stage description"
                autoSize={{
                  minRows: 3,
                  maxRows: 3,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default StageInfoModal;
