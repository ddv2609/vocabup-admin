import React, { useEffect, useState } from "react";
import { MemberService } from "../../service";
import { User } from "../../types/members";
import { Page, Params } from "../../types";

import styles from "./UsersManagement.module.scss";
import clsx from "clsx";
import {
  Avatar,
  Button,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tabs,
  Tooltip,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { FaUserAlt } from "react-icons/fa";
import moment from "moment";
import { BiDetail } from "react-icons/bi";
import {
  MdHideSource,
  MdLockOpen,
  MdOutlineMarkEmailRead,
} from "react-icons/md";
import { RxReload } from "react-icons/rx";
import { AiOutlineDelete } from "react-icons/ai";
import { useReduxDispatch } from "../../hooks";
import { callMessage } from "../../redux/slice";
import { MessageType } from "../../constants";
import DetailUserModal from "../../components/Modal/DetailUserModal";
import FilterMembers from "../../components/FilterMembers";
import { FormattedMessage, useIntl } from "react-intl";

const UsersManagement: React.FC = () => {
  const dispatch = useReduxDispatch();

  const intl = useIntl();

  const [users, setUsers] = useState<User[]>([]);
  const [hidden, setHidden] = useState<boolean>(false);
  const [pageInfo, setPageInfo] = useState<Page>({
    currPage: 0,
    size: 10,
    totalRecords: 0,
  });

  const [usersLoading, setUsersLoading] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User>();
  const [toggleDetailUserModal, setToggleDetailUserModal] =
    useState<boolean>(false);

  const [filterInfo, setFilterInfo] = useState<Params>({
    q: "",
    gender: "",
    addr: "",
    fromDate: null,
    toDate: null,
  });

  const handleToggleDetailUserModal = () =>
    setToggleDetailUserModal((prev) => !prev);

  const handleChangeFilterInfo = (
    key: string,
    val: string | number | boolean | unknown
  ) => setFilterInfo((prev) => ({ ...prev, [key]: val }));

  const getUsersInfo = async (
    needPage: number,
    size: number,
    hidden: boolean
  ) => {
    setUsersLoading(true);
    const { data: response } = await MemberService.getUsersByPage(
      needPage - 1,
      size,
      hidden,
      filterInfo
    );
    setUsers(response.data.users);
    setPageInfo((prev) => ({
      ...prev,
      size,
      currPage: needPage,
      totalRecords: response.data.totalUsers,
    }));
    setUsersLoading(false);
  };

  const handleFilterUsers = async () =>
    await getUsersInfo(1, pageInfo.size, hidden);

  const handleChangeTabs = async (tab: string) => {
    setHidden((prev) => !prev);
    setPageInfo({
      currPage: 0,
      size: 10,
      totalRecords: 0,
    });
    await getUsersInfo(
      1,
      pageInfo.size,
      tab === intl.formatMessage({ id: "users-management.available-users" })
        ? false
        : true
    );
  };

  const handleChangePage = async (page: number, pageSize: number) => {
    await getUsersInfo(page, pageSize, hidden);
  };

  const handleReload = async () => {
    await getUsersInfo(pageInfo.currPage || 1, pageInfo.size, hidden);
  };

  const handleHideUsers = async (userIds: string[]) => {
    const response = await MemberService.hideManyUsers(userIds);
    setUsers((prev) => prev.filter((user) => !userIds.includes(user._id)));
    dispatch(
      callMessage({
        type: MessageType.SUCCESS,
        content: response.data.message,
      })
    );

    return Promise.resolve();
  };

  const handleEnableUsers = async (userIds: string[]) => {
    const response = await MemberService.enableManyUsers(userIds);
    setUsers((prev) => prev.filter((user) => !userIds.includes(user._id)));
    dispatch(
      callMessage({
        type: MessageType.SUCCESS,
        content: response.data.message,
      })
    );
    return Promise.resolve();
  };

  const handleDeleteUsers = async (userIds: string[]) => {
    const { data: response, status } = await MemberService.deleteMembers(
      userIds
    );
    if (status < 400) {
      setUsers((prev) => prev.filter((user) => !userIds.includes(user._id)));
      dispatch(
        callMessage({
          type: MessageType.SUCCESS,
          content: response.message,
        })
      );
    }
    return Promise.resolve();
  };

  useEffect(() => {
    getUsersInfo(pageInfo.currPage + 1, pageInfo.size, hidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: TableProps<User>["columns"] = [
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
              src={<img src={avatar} alt="User Avatar" />}
            />
          ) : (
            <Avatar icon={<FaUserAlt />} />
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
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.joining-date" />
        </span>
      ),
      dataIndex: "verifiedAt",
      key: "verifiedAt",
      render: (verifiedAt, record) => (
        <span className="txt---400-14-18-regular">
          {moment(verifiedAt || record.createdAt).format("DD/MM/YYYY")}
        </span>
      ),
      ellipsis: true,
      align: "center",
    },
    {
      title: (
        <span className="txt---600-14-18-bold">
          <FormattedMessage id="common.actions" />
        </span>
      ),
      key: "action",
      render: (record: User) => (
        <div className={styles.actionsContainer}>
          <Tooltip title={<FormattedMessage id="common.view-detail" />}>
            <button
              className={clsx([styles.btnAction, styles.seeDetail])}
              onClick={() => {
                setCurrentUser(record);
                handleToggleDetailUserModal();
              }}
            >
              <BiDetail />
            </button>
          </Tooltip>
          {hidden ? (
            <>
              <Tooltip title={<FormattedMessage id="common.delete" />}>
                <Popconfirm
                  title={intl.formatMessage({
                    id: "users-management.delete-the-user",
                  })}
                  description={intl.formatMessage({
                    id: "users-management.confirm-delete-user",
                  })}
                  okText={intl.formatMessage({ id: "common.yes" })}
                  cancelText={intl.formatMessage({ id: "common.no" })}
                  placement="topLeft"
                  onConfirm={() => handleDeleteUsers([record._id])}
                >
                  <button className={clsx([styles.btnAction, styles.delete])}>
                    <AiOutlineDelete />
                  </button>
                </Popconfirm>
              </Tooltip>
              <Tooltip title={<FormattedMessage id="common.unlock" />}>
                <Popconfirm
                  title={intl.formatMessage({
                    id: "users-management.unlock-the-user",
                  })}
                  description={intl.formatMessage({
                    id: "users-management.confirm-unlock-user",
                  })}
                  okText={intl.formatMessage({ id: "common.yes" })}
                  cancelText={intl.formatMessage({ id: "common.no" })}
                  placement="topLeft"
                  onConfirm={() => handleEnableUsers([record._id])}
                >
                  <button className={clsx([styles.btnAction, styles.unlock])}>
                    <MdLockOpen />
                  </button>
                </Popconfirm>
              </Tooltip>
            </>
          ) : (
            <>
              <Tooltip
                title={
                  record.verifiedAt ? null : (
                    <FormattedMessage id="users-management.verify-account" />
                  )
                }
              >
                <button
                  className={clsx([
                    styles.btnAction,
                    styles.email,
                    record.verifiedAt && styles.disable,
                  ])}
                >
                  <MdOutlineMarkEmailRead />
                </button>
              </Tooltip>
              <Tooltip title={<FormattedMessage id="common.hide" />}>
                <Popconfirm
                  title={intl.formatMessage({
                    id: "users-management.hide-the-user",
                  })}
                  description={intl.formatMessage({
                    id: "users-management.confirm-hide-user",
                  })}
                  okText={intl.formatMessage({ id: "common.yes" })}
                  cancelText={intl.formatMessage({ id: "common.no" })}
                  placement="topLeft"
                  onConfirm={() => handleHideUsers([record._id])}
                >
                  <button className={clsx([styles.btnAction, styles.hide])}>
                    <MdHideSource />
                  </button>
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </div>
      ),
      width: 100,
      fixed: "right",
      align: "center",
    },
  ];

  return (
    <div className={styles.usersManagementContainer}>
      <div className={clsx([styles.tabsContainer], "tabsContainer")}>
        <Tabs
          onChange={handleChangeTabs}
          type="card"
          items={[
            intl.formatMessage({ id: "users-management.available-users" }),
            intl.formatMessage({ id: "users-management.hidden-users" }),
          ].map((lable) => ({
            label: <span className="txt---400-14-18-regular">{lable}</span>,
            key: lable,
            children: (
              <div className={styles.tableUsersInfoContainer}>
                <Table<User>
                  columns={columns}
                  dataSource={users}
                  size="small"
                  rowKey="_id"
                  scroll={{ x: "max-content" }}
                  title={() => (
                    <div className={styles.tableHeaderContainer}>
                      {/* <h3
                        className={clsx([
                          "txt---400-16-20-regular",
                          styles.heading,
                        ])}
                      >
                        {!hidden
                          ? "List Of Available Users"
                          : "List Of Hidden Users"}
                      </h3> */}
                      <FilterMembers
                        filterInfo={filterInfo}
                        handleChangeFilterInfo={handleChangeFilterInfo}
                        handleFilterUsers={handleFilterUsers}
                      />
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
                    spinning: usersLoading,
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
            ),
          }))}
        />
      </div>

      {currentUser && (
        <DetailUserModal
          user={currentUser}
          modalStatus={toggleDetailUserModal}
          onCancel={() => handleToggleDetailUserModal()}
        />
      )}
    </div>
  );
};

export default UsersManagement;
