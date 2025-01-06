import React, { useEffect, useState } from "react";

import styles from "./DetailUserModal.module.scss";
import {
  Avatar,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import { User } from "../../types";
import { EyeOutlined } from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import { FaUser } from "react-icons/fa6";
import { FormattedMessage } from "react-intl";

type DetailUserModalProps = {
  user: User;
  modalStatus: boolean;
  onCancel: () => void;
};

const DetailUserModal: React.FC<DetailUserModalProps> = ({
  user,
  modalStatus,
  onCancel,
}) => {
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const [userForm] = useForm();

  const handleOpenPreview = () => setPreviewOpen(true);

  useEffect(() => {
    userForm.setFieldsValue({
      fullName: `${user.fullName.firstName} ${user.fullName.lastName}`,
      email: user.email,
      dob: user.dob ? dayjs(user.dob) : null,
      gender: user.gender,
      country: user.address.country,
      province: user.address.province,
      ward: user.address.ward,
      district: user.address.district,
      detail: user.address.detail,
      tel: user.tel,
      gems: user.gems,
      scores: user.scores,
      highestStreak: user.streak?.highestStreak,
      currentStreak: user.streak?.currentStreak,
      lastActivityDate: user.streak?.lastActivityDate
        ? dayjs(user.streak.lastActivityDate)
        : null,
    });
  }, [user, userForm]);

  return (
    <Modal
      open={modalStatus}
      centered
      maskClosable={false}
      title={
        <span className="txt---600-16-20-bold">
          <FormattedMessage
            id={`common.${user.role === "admin" ? "admin-info" : "user-info"}`}
          />
        </span>
      }
      onCancel={onCancel}
      okText="Update"
      // okButtonProps={{
      //   disabled: true,
      // }}
      footer={null}
    >
      <div className={styles.userInfoConatiner}>
        <div className={styles.userAvatar}>
          <div className={styles.userAvatarWrapper} onClick={handleOpenPreview}>
            <Avatar
              shape="circle"
              className={styles.image}
              size={104}
              src={user.avatar}
              icon={user?.avatar || <FaUser />}
            />
            <EyeOutlined className={styles.iconEye} />
          </div>
        </div>
        <div className={styles.userFormContainer}>
          <Form
            form={userForm}
            layout="vertical"
            variant="filled"
            size="large"
            requiredMark="optional"
            labelCol={{
              style: { paddingBottom: 0 },
            }}
          >
            <Row gutter={[12, 0]}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.fullname" />
                    </span>
                  }
                  name="fullName"
                  required
                  rules={[
                    { required: true, message: "Please enter full name!" },
                  ]}
                  tooltip="This is a required field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Enter full name"
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="txt---600-14-18-bold">Email</span>}
                  name="email"
                  required
                  rules={[{ required: true, message: "Please enter email!" }]}
                  tooltip="This is a required field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Enter email"
                    readOnly
                    // disabled
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.dob" />
                    </span>
                  }
                  name="dob"
                  tooltip="This is a optional field"
                >
                  <DatePicker size="middle" format="DD/MM/YYYY" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.gender" />
                    </span>
                  }
                  name="gender"
                  tooltip="This is a optional field"
                >
                  <Select
                    options={[
                      {
                        value: "male",
                        label: <FormattedMessage id="common.male" />,
                      },
                      {
                        value: "female",
                        label: <FormattedMessage id="common.female" />,
                      },
                      {
                        value: "other",
                        label: <FormattedMessage id="common.other" />,
                      },
                    ]}
                    size="middle"
                    allowClear
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.country" />
                    </span>
                  }
                  name="country"
                  tooltip="This is a optional field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Country"
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.province" />
                    </span>
                  }
                  name="province"
                  tooltip="This is a optional field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Province"
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.ward" />
                    </span>
                  }
                  name="ward"
                  tooltip="This is a optional field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Ward"
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.district" />
                    </span>
                  }
                  name="district"
                  tooltip="This is a optional field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="District"
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.detail-address" />
                    </span>
                  }
                  name="detail"
                  tooltip="This is a optional field"
                >
                  <Input
                    className="txt---400-14-18-regular"
                    placeholder="Detail address"
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.telephone" />
                    </span>
                  }
                  name="tel"
                  tooltip="This is a optional field"
                >
                  <Input
                    type="tel"
                    className="txt---400-14-18-regular"
                    placeholder="Telephone"
                    maxLength={15}
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.highest-streak" />
                    </span>
                  }
                  name="highestStreak"
                  tooltip="This is a optional field"
                >
                  <Input className="txt---400-14-18-regular" readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="txt---600-14-18-bold">Gems</span>}
                  name="gems"
                  tooltip="This is a optional field"
                >
                  <Input className="txt---400-14-18-regular" readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.scores" />
                    </span>
                  }
                  name="scores"
                  tooltip="This is a optional field"
                >
                  <Input className="txt---400-14-18-regular" readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.current-streak" />
                    </span>
                  }
                  name="currentStreak"
                  tooltip="This is a optional field"
                >
                  <Input className="txt---400-14-18-regular" readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="txt---600-14-18-bold">
                      <FormattedMessage id="common.last-activity-date" />
                    </span>
                  }
                  name="lastActivityDate"
                  tooltip="This is a optional field"
                >
                  <DatePicker size="middle" format="DD/MM/YYYY" disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      {user.avatar && (
        <Image
          wrapperStyle={{
            display: "none",
          }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
          }}
          src={user.avatar}
        />
      )}
    </Modal>
  );
};

export default DetailUserModal;
