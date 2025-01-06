import React, { useEffect, useState } from "react";
import { MemberService } from "../../service";
import { Admin } from "../../types/members";
import { Page } from "../../types";

import styles from "./AdminsManagement.module.scss";
import clsx from "clsx";
import { Avatar, Button, Space, Table, TableProps, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import { RxReload } from "react-icons/rx";
import { FaUserShield } from "react-icons/fa6";
import { FormattedMessage, useIntl } from "react-intl";

const AdminsManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pageInfo, setPageInfo] = useState<Page>({
    currPage: 0,
    size: 10,
    totalRecords: 0,
  });

  const [adminsLoading, setAdminsLoading] = useState<boolean>(false);
  const intl = useIntl();

  const getAdminsInfo = async (needPage: number, size: number) => {
    setAdminsLoading(true);
    const { data: response } = await MemberService.getAdminsByPage(
      needPage - 1,
      size
    );

    setAdmins(response.data.admins);
    setPageInfo((prev) => ({
      ...prev,
      size,
      currPage: needPage,
      totalRecords: response.data.totalAdmins,
    }));
    setAdminsLoading(false);
  };

  const handleChangePage = async (page: number, pageSize: number) => {
    await getAdminsInfo(page, pageSize);
  };

  const handleReload = async () => {
    await getAdminsInfo(pageInfo.currPage || 1, pageInfo.size);
  };

  useEffect(() => {
    getAdminsInfo(pageInfo.currPage + 1, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableProps<Admin>["columns"] = [
    {
      title: <span className="txt---600-14-18-bold">Avatar</span>,
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => (
        <>
          {avatar ? (
            <Avatar
              shape="square"
              // size={32}
              src={<img src={avatar} alt="Admin Avatar" />}
            />
          ) : (
            <Avatar icon={<FaUserShield />} />
          )}
        </>
      ),
      align: "center",
      fixed: "left",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.fullname" />
        </span>
      ),
      dataIndex: "fullName",
      key: "fullName",
      render: (fullName) => (
        <span className="txt---400-14-18-regular">{`${fullName.firstName} ${fullName.lastName}`}</span>
      ),
      align: "center",
      fixed: "left",
    },
    {
      title: <span className="txt---600-14-18-bold">Email</span>,
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <span className="txt---400-14-18-regular">{email}</span>
      ),
      ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.dob" />
        </span>
      ),
      dataIndex: "dob",
      key: "dob",
      render: (dob) => (
        <span className="txt---400-14-18-regular">
          {dob ? moment(dob).format("DD/MM/YYYY") : "--/--/----"}
        </span>
      ),
      ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.gender" />
        </span>
      ),
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (
        <div className={styles.genderContainer}>
          <div
            className={clsx([
              "txt---400-14-18-regular",
              styles.gender,
              styles[gender],
            ])}
          >
            {gender
              ? intl.formatMessage({ id: `common.${gender}` })
              : intl.formatMessage({ id: "common.not-updated" })}
          </div>
        </div>
      ),
      ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.address" />
        </span>
      ),
      dataIndex: "address",
      key: "address",
      render: (address) => (
        <span className="txt---400-14-18-regular">
          {Object.keys(address)
            .reverse()
            .map((key) => address[key] || "_")
            .join(", ")}
        </span>
      ),
      ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.telephone" />
        </span>
      ),
      dataIndex: "tel",
      key: "tel",
      render: (tel) => <span className="txt---400-14-18-regular">{tel}</span>,
      ellipsis: true,
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
      render: (createdAt) => (
        <span className="txt---400-14-18-regular">
          {moment(createdAt).format("DD/MM/YYYY")}
        </span>
      ),
      ellipsis: true,
      align: "center",
    },
  ];
  return (
    <div className={styles.adminsManagementContainer}>
      <div className={styles.tabsContainer}>
        <div className={styles.tableAdminsInfoContainer}>
          <Table<Admin>
            columns={columns}
            dataSource={admins}
            size="small"
            rowKey="_id"
            scroll={{ x: "max-content" }}
            title={() => (
              <div className={styles.tableHeaderContainer}>
                <h3
                  className={clsx(["txt---400-16-20-regular", styles.heading])}
                >
                  <FormattedMessage id="menu.list-of-admins" />
                </h3>
                <Space className={styles.actions}>
                  <Tooltip
                    title={intl.formatMessage({ id: "common.reload" })}
                    placement="topRight"
                  >
                    <Button
                      icon={<RxReload />}
                      shape="circle"
                      onClick={handleReload}
                    />
                  </Tooltip>
                </Space>
              </div>
            )}
            loading={{
              spinning: adminsLoading,
              indicator: <LoadingOutlined spin />,
            }}
            rowSelection={{
              type: "checkbox",
            }}
            pagination={{
              pageSize: pageInfo.size,
              current: pageInfo.currPage || 1,
              total: pageInfo.totalRecords,
              onChange: handleChangePage,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminsManagement;
