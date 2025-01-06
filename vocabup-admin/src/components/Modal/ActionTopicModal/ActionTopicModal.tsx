import React, { useEffect, useState } from "react";

import styles from "./ActionTopicModal.module.scss";
import { Col, Form, Input, Modal, Row } from "antd";
import { useReduxDispatch, useReduxSelector } from "../../../hooks";
import { callMessage, setCurrentTopic, setTopics } from "../../../redux/slice";
import { useForm } from "antd/es/form/Form";
import UploadImage from "../../Upload/UploadImage/UploadImage";
import { WordService } from "../../../service";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Topic } from "../../../types/topic";
import { ActionType, EventEmit, MessageType } from "../../../constants";
import _ from "lodash";
import emitter from "../../../utils/EventEmitter";
import { FormattedMessage, useIntl } from "react-intl";

const ActionTopicModal: React.FC = () => {
  const currentTopic = useReduxSelector((state) => state.word.currentTopic);
  const allTopics = useReduxSelector((state) => state.word.topics);
  const dispatch = useReduxDispatch();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const intl = useIntl();

  const [topicFrm] = useForm();

  const handleCancelTopicModal = () => {
    dispatch(setCurrentTopic(null));
  };

  const handleUploadImage = async (
    options: UploadRequestOption,
    afterUpload: () => void
  ) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("file", file as Blob);
    const { data: response, status } = await WordService.updateTopicImage(
      currentTopic!._id,
      currentTopic?.imageId,
      formData
    );

    if (status < 400) {
      const newCurrentTopic: Topic = {
        ...currentTopic!,
        image: response.data.image,
        imageId: response.data.imageId,
      };
      const newTopics = allTopics.map((topic: Topic) =>
        topic._id === currentTopic?._id ? newCurrentTopic : topic
      );
      dispatch(setCurrentTopic(newCurrentTopic));
      dispatch(setTopics(newTopics));
      emitter.emit(EventEmit.ActionTopic, {
        action: ActionType.UPDATE,
        topic: newCurrentTopic,
      });

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    afterUpload();
  };

  const handleDeleteImage = async (afterDelete: () => void) => {
    const { data: response, status } = await WordService.deleteTopicImage(
      currentTopic!._id,
      currentTopic!.imageId!
    );
    if (status < 400) {
      const newCurrentTopic: Topic = {
        ...currentTopic!,
        image: null,
        imageId: null,
      };
      const newTopics = allTopics.map((topic: Topic) =>
        topic._id === currentTopic?._id ? newCurrentTopic : topic
      );
      dispatch(setCurrentTopic(newCurrentTopic));
      dispatch(setTopics(newTopics));
      emitter.emit(EventEmit.ActionTopic, {
        action: ActionType.UPDATE,
        topic: newCurrentTopic,
      });

      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    afterDelete();
  };

  const handleSubmitForm = async () => {
    const payload = await topicFrm.validateFields();
    setConfirmLoading(true);
    let resp;
    if (!currentTopic?._id || !payload.topic.trim()) {
      setConfirmLoading(true);
      return;
    }

    if (!currentTopic?._id.includes("new")) {
      resp = await WordService.updateTopic({
        _id: currentTopic?._id,
        topic: payload.topic,
      });
    } else {
      resp = await WordService.addNewTopic([payload.topic]);
    }

    const { data: response, status } = resp;

    if (status < 400) {
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
      dispatch(setCurrentTopic(response.data.topic));

      if (!currentTopic?._id.includes("new")) {
        const updatedTopics = allTopics.map((topic: Topic) =>
          topic._id === currentTopic?._id ? response.data.topic : topic
        );
        dispatch(setTopics(updatedTopics));
        emitter.emit(EventEmit.ActionTopic, {
          action: ActionType.UPDATE,
          topic: response.data.topic,
        });
      } else {
        emitter.emit(EventEmit.ActionTopic, {
          action: ActionType.ADD,
          topic: {} as Topic,
          topics: response.data.topics.map((topic: Topic) =>
            _.omit(topic, ["__v"])
          ) as Topic[],
        });
        dispatch(
          setTopics([
            ...allTopics,
            ...response.data.topics.map((topic: Topic) =>
              _.omit(topic, ["__v"])
            ),
          ])
        );
      }
    }
    setConfirmLoading(false);
  };

  useEffect(() => {
    topicFrm.setFieldsValue({
      imageId: currentTopic?.imageId,
      topic: currentTopic?.topic,
    });
  }, [currentTopic, topicFrm]);

  return (
    <Modal
      open={!!currentTopic?._id}
      maskClosable={false}
      onCancel={handleCancelTopicModal}
      okText={
        <span className="txt---400-14-18-regular">
          {intl.formatMessage({
            id: `common.${currentTopic?._id !== "new" ? "update" : "add"}`,
          })}
          {}
        </span>
      }
      cancelText={
        <span className="txt---400-14-18-regular">
          <FormattedMessage id="common.cancel" />
        </span>
      }
      title={
        <span className="txt---600-16-20-bold">
          <FormattedMessage
            id={`topics-management.${
              currentTopic?._id !== "new" ? "update-topic" : "add-new-topic"
            }`}
          />
        </span>
      }
      onOk={handleSubmitForm}
      // okButtonProps={{
      //   disabled: !currentTopic?.topic.trim(),
      // }}
      confirmLoading={confirmLoading}
    >
      <div className={styles.actionTopicModalContainer}>
        <div className={styles.topicImageContainer}>
          {/* <Avatar
            shape="square"
            size={104}
            src={currentTopic?.image}
            icon={currentTopic?.image ? null : <TbCategoryPlus />}
          /> */}
          <UploadImage
            src={currentTopic?.image}
            obj={currentTopic}
            handleUploadImage={handleUploadImage}
            handleDeleteImage={handleDeleteImage}
          />
        </div>
        <Form
          form={topicFrm}
          layout="vertical"
          variant="filled"
          size="large"
          requiredMark="optional"
          labelCol={{
            style: { paddingBottom: 0 },
          }}
        >
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="txt---600-14-18-bold">
                    <FormattedMessage id="common.image-id" />
                  </span>
                }
                name="imageId"
                tooltip="This is a disable field"
              >
                <Input
                  className="txt---400-14-18-regular"
                  placeholder={
                    currentTopic?.imageId ||
                    intl.formatMessage({ id: "common.not-updated-yet" })
                  }
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="txt---600-14-18-bold">
                    <FormattedMessage id="common.topic" />
                  </span>
                }
                name="topic"
                rules={[
                  { required: true, message: "Please enter a topic name" },
                ]}
                tooltip="This is a required field"
              >
                <Input
                  className="txt---400-14-18-regular"
                  placeholder="Enter a topic name"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default ActionTopicModal;
