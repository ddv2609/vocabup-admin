import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";

import { BsFillTelephoneFill } from "react-icons/bs";
import { TfiEmail } from "react-icons/tfi";
import { FaBirthdayCake } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";

import moment from "moment";

import styles from "./PersonalInfomation.module.scss";
import React, { useEffect, useState } from "react";
import { useReduxDispatch, useReduxSelector } from "../../hooks";
import { Admin } from "../../types";
import { useForm } from "antd/es/form/Form";
import dayjs from "dayjs";
import clsx from "clsx";

import UploadAvatar from "../../components/Upload/UploadAvatar/UploadAvatar";
import { UploadRequestOption } from "rc-upload/lib/interface";
import {
  callMessage,
  loadingFullScreen,
  updateAccountInfo,
} from "../../redux/slice";
import { MessageType } from "../../constants";
import { MemberService } from "../../service";
import { omit } from "lodash";

const PersonalInfomation: React.FC = () => {
  const admin = useReduxSelector((state) => state.app.admin) as Admin;
  const dispatch = useReduxDispatch();

  const [editable, setEditable] = useState<boolean>(false);

  const [accountFrm] = useForm();

  const handleUploadAvatar = async (
    options: UploadRequestOption,
    afterUpload: () => void
  ) => {
    const { file } = options;
    const formData = new FormData();
    formData.append("avatar", file as Blob);
    const { data: response, status } = await MemberService.uploadAvatar(
      admin.uid,
      admin.avatarId,
      formData
    );

    if (status < 400) {
      dispatch(updateAccountInfo(response.data));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    afterUpload();
  };

  const handleDeleteAvatar = async (afterDelete: () => void) => {
    if (!admin.avatarId) return;
    const { data: response, status } = await MemberService.deleteAvatar(
      admin.uid,
      admin.avatarId!
    );
    if (status < 400) {
      dispatch(
        updateAccountInfo({
          avatar: null,
          avatarId: null,
        })
      );
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    afterDelete();
  };

  const handleUpdateAccInfo = async () => {
    accountFrm.validateFields().then(async (data) => {
      dispatch(loadingFullScreen(true));
      setEditable(false);
      const memberInfo = {
        uid: admin.uid,
        fullName: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
        address: {
          country: data.country,
          province: data.province,
          district: data.district,
          ward: data.ward,
          detail: data.detail,
        },
        ...omit(data, [
          "email",
          "firstName",
          "lastName",
          "country",
          "province",
          "district",
          "ward",
          "detail",
        ]),
      };

      const { data: response, status } = await MemberService.updateMemberInfo(
        memberInfo
      );

      if (status < 400) {
        dispatch(updateAccountInfo(response.data.info));
        dispatch(
          callMessage({
            type: MessageType.SUCCESS,
            content: response.message,
          })
        );
      }
      dispatch(loadingFullScreen(false));
    });
  };

  useEffect(() => {
    accountFrm.setFieldsValue({
      firstName: admin.fullName.firstName,
      lastName: admin.fullName.lastName,
      email: admin.email,
      dob: admin.dob ? dayjs(admin.dob) : null,
      gender: admin.gender,
      country: admin.address.country,
      province: admin.address.province,
      ward: admin.address.ward,
      district: admin.address.district,
      detail: admin.address.detail,
      tel: admin.tel,
    });
  }, [admin, accountFrm]);

  return (
    <div className={styles.account}>
      <div className={styles.info}>
        <h3 className={clsx([styles.adminName, "txt---600-24-32-bold"])}>{`${
          admin!.fullName.firstName
        } ${admin!.fullName.lastName}`}</h3>
        <p className={clsx([styles.role, "txt---600-12-16-bold"])}>
          {admin.role}
        </p>
      </div>
      <div className={styles.adminAvatar}>
        <UploadAvatar
          src={admin.avatar}
          obj={admin}
          handleUploadImage={handleUploadAvatar}
          handleDeleteImage={handleDeleteAvatar}
        />
      </div>
      <div className={styles.info}>
        <p className={clsx([styles.address, "txt---600-10-14-bold"])}>
          <IoLocationSharp />
          <span>{admin.address.country || "Undetermined"}</span>
        </p>
        <Row justify="center" align="middle" gutter={[24, 0]}>
          <Col>
            <p className={clsx([styles.tel, "txt---600-10-14-bold"])}>
              <BsFillTelephoneFill />
              <span>{admin.tel || "Undetermined"}</span>
            </p>
          </Col>
          <Col>
            <p className={clsx([styles.email, "txt---600-10-14-bold"])}>
              <TfiEmail />
              <span>{admin.email || "Undetermined"}</span>
            </p>
          </Col>
          <Col>
            <p className={clsx([styles.dob, "txt---600-10-14-bold"])}>
              <FaBirthdayCake />
              <span>
                {admin.dob
                  ? moment(admin.dob).format("DD/MM/YYYY")
                  : "Undetermined"}
              </span>
            </p>
          </Col>
        </Row>
      </div>
      {admin && (
        <div className={styles.adminInfoConatiner}>
          <div className={styles.adminFormContainer}>
            <Form
              form={accountFrm}
              layout="vertical"
              variant="filled"
              size="large"
              requiredMark="optional"
              labelCol={{
                style: { paddingBottom: 0 },
              }}
            >
              <Row gutter={[12, 0]}>
                <Col span={6}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">First Name</span>
                    }
                    name="firstName"
                    required
                    rules={[
                      { required: true, message: "Please enter first name!" },
                    ]}
                    tooltip="This is a required field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="Enter first name"
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">Last Name</span>
                    }
                    name="lastName"
                    required
                    rules={[
                      { required: true, message: "Please enter last name!" },
                    ]}
                    tooltip="This is a required field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="Enter last name"
                      readOnly={!editable}
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
                <Col span={6}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">Telephone</span>
                    }
                    name="tel"
                    tooltip="This is a optional field"
                  >
                    <Input
                      type="tel"
                      className="txt---400-14-18-regular"
                      placeholder="Telephone"
                      maxLength={15}
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<span className="txt---600-14-18-bold">Gender</span>}
                    name="gender"
                    tooltip="This is a optional field"
                  >
                    <Select
                      options={[
                        {
                          value: "male",
                          label: "Nam",
                        },
                        {
                          value: "female",
                          label: "Nữ",
                        },
                        {
                          value: "other",
                          label: "Khác",
                        },
                      ]}
                      size="middle"
                      allowClear
                      disabled={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">
                        Date Of Birth
                      </span>
                    }
                    name="dob"
                    tooltip="This is a optional field"
                  >
                    <DatePicker
                      size="middle"
                      format="DD/MM/YYYY"
                      disabled={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">Country</span>
                    }
                    name="country"
                    tooltip="This is a optional field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="Country"
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">Province</span>
                    }
                    name="province"
                    tooltip="This is a optional field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="Province"
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">District</span>
                    }
                    name="district"
                    tooltip="This is a optional field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="District"
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={<span className="txt---600-14-18-bold">Ward</span>}
                    name="ward"
                    tooltip="This is a optional field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="Ward"
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item
                    label={
                      <span className="txt---600-14-18-bold">
                        Detail Address
                      </span>
                    }
                    name="detail"
                    tooltip="This is a optional field"
                  >
                    <Input
                      className="txt---400-14-18-regular"
                      placeholder="Detail address"
                      readOnly={!editable}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
          <div className={styles.changeInfo}>
            {editable && (
              <Button
                type="default"
                danger
                onClick={() => {
                  setEditable((prev) => !prev);
                }}
              >
                Cancel
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => {
                if (editable) {
                  handleUpdateAccInfo();
                } else {
                  setEditable((prev) => !prev);
                }
              }}
            >
              {editable ? "Save" : "Edit personal information"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfomation;
