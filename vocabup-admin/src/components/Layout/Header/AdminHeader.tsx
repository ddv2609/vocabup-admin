import React from "react";

import styles from "./AdminHeader.module.scss";
import { Avatar, Dropdown, MenuProps, Select, Space } from "antd";
import { useReduxDispatch, useReduxSelector } from "../../../hooks";
import { FaUserShield } from "react-icons/fa6";
import {
  AiOutlineLogout,
  AiOutlineMail,
  AiOutlineSetting,
} from "react-icons/ai";
import { FaInfoCircle } from "react-icons/fa";
import { IoNotificationsSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { Path } from "../../../constants";
import { logout, selectMenuSidebar, setLanguage } from "../../../redux/slice";
import { GrLanguage } from "react-icons/gr";
import VietNamIcon from "../../../assets/vietnam.svg?react";
import EnglishIcon from "../../../assets/english.svg?react";
import { FormattedMessage } from "react-intl";

const AdminHeader: React.FC = () => {
  const admin = useReduxSelector((state) => state.app.admin);
  const dispatch = useReduxDispatch();
  const language = useReduxSelector((state) => state.app.language);

  const nav = useNavigate();

  const changeTabItem = (tab: string[]) => dispatch(selectMenuSidebar(tab));

  const handleLogout = () => {
    changeTabItem(["1"]);
    dispatch(logout());
  };

  const accountItems: MenuProps["items"] = [
    {
      key: 1,
      label: (
        <Space align="center" size={12} className={styles.actionItem}>
          <span className={styles.actionIcon}>
            <AiOutlineMail />
          </span>
          <span className="txt---600-12-16-bold">Inbox</span>
        </Space>
      ),
    },
    {
      key: 2,
      label: (
        <Space
          align="center"
          size={12}
          className={styles.actionItem}
          onClick={() => {
            nav(Path.PERSONAL_INFO);
            changeTabItem(["9"]);
          }}
        >
          <span className={styles.actionIcon}>
            <FaInfoCircle />
          </span>
          <span className="txt---600-12-16-bold">Account Infomation</span>
        </Space>
      ),
    },
    {
      key: 3,
      label: (
        <Space
          align="center"
          size={12}
          className={styles.actionItem}
          onClick={() => {
            nav(Path.NOTIFICATIONS_MANAGEMENT);
            changeTabItem(["12"]);
          }}
        >
          <span className={styles.actionIcon}>
            <IoNotificationsSharp />
          </span>
          <span className="txt---600-12-16-bold">Notification</span>
        </Space>
      ),
    },
    {
      key: 4,
      label: (
        <Space align="center" size={12} className={styles.actionItem}>
          <span className={styles.actionIcon}>
            <AiOutlineSetting />
          </span>
          <span className="txt---600-12-16-bold">Setting</span>
        </Space>
      ),
    },
    {
      key: 5,
      label: (
        <Space
          align="center"
          size={12}
          className={styles.actionItem}
          onClick={handleLogout}
        >
          <span className={styles.actionIcon}>
            <AiOutlineLogout />
          </span>
          <span className="txt---600-12-16-bold">Log out</span>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.adminHeaderContainer}>
      <Select
        className={styles.selectLangContainer}
        value={language}
        options={[
          {
            value: "vi",
            label: (
              <div className={styles.language}>
                <VietNamIcon />
                <span className={"txt---400-12-16-regular"}>
                  <FormattedMessage id="language.vi" />
                </span>
              </div>
            ),
          },
          {
            value: "en",
            label: (
              <div className={styles.language}>
                <EnglishIcon />
                <span className={"txt---400-12-16-regular"}>
                  <FormattedMessage id="language.en" />
                </span>
              </div>
            ),
          },
        ]}
        size="middle"
        onChange={(val) => dispatch(setLanguage(val))}
        suffixIcon={<GrLanguage />}
      />
      <Dropdown
        menu={{
          items: accountItems,
        }}
        trigger={["click"]}
      >
        <div className={styles.adminGeneralInfo}>
          <Avatar src={admin?.avatar} icon={<FaUserShield />} size={24} />
          <span className="txt---600-12-16-bold">{`${admin?.fullName.firstName} ${admin?.fullName.lastName}`}</span>
        </div>
      </Dropdown>
    </div>
  );
};

export default AdminHeader;
