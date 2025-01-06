import React, { useRef, useState } from "react";
import { Menu, Modal, Space } from "antd";
import Sider from "antd/es/layout/Sider";

import styles from "./AdminSider.module.scss";
import { useNavigate } from "react-router-dom";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { MenuProps } from "rc-menu";
import { FaBars } from "react-icons/fa6";
import { TbGridDots } from "react-icons/tb";
import { useReduxDispatch, useReduxSelector } from "../../../hooks";
import { logout, selectMenuSidebar } from "../../../redux/slice";
import { Path } from "../../../constants";
import clsx from "clsx";
import { RiErrorWarningFill } from "react-icons/ri";

interface AdminSiderProps {
  items: ItemType<MenuItemType>[];
  collapsed: boolean;
  handleToggleSider: () => void;
}

const AdminSider: React.FC<AdminSiderProps> = ({
  items = [],
  collapsed = false,
  handleToggleSider,
}) => {
  const nav = useNavigate();
  const lastSelectedTabItem = useReduxSelector(
    (state) => state.app.tabSelected
  );
  const dispatch = useReduxDispatch();
  const changeTabItem = (tab: string[]) => dispatch(selectMenuSidebar(tab));

  const [toggleModalLogout, setToggleModalLogout] = useState<boolean>(false);
  const previousSelectedTab = useRef<string[] | null>(lastSelectedTabItem);

  const handleOpenModalConfirmLogout = () => {
    setToggleModalLogout(true);
    previousSelectedTab.current = lastSelectedTabItem;
  };

  const handleCancelModalConfirmLogout = () => {
    changeTabItem(previousSelectedTab.current || ["1"]);
    setToggleModalLogout(false);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
  };

  const handleSelectItems: MenuProps["onSelect"] = (info) => {
    changeTabItem(info.keyPath);

    switch (info.key) {
      case "2.1":
        nav(Path.USERS_MANAGEMENT);
        break;

      case "2.2":
        nav(Path.ADMINS_MANAGEMENT);
        break;

      case "3":
        nav(Path.TOPICS_MANAGEMENT);
        break;

      case "4":
        nav(Path.WORDS_MANAGEMENT);
        break;

      case "5":
        nav(Path.STAGES_MANAGEMENT);
        break;

      case "6":
        nav(Path.BLOGS_MANAGEMENT);
        break;

      case "9":
        nav(Path.PERSONAL_INFO);
        break;

      case "12":
        nav(Path.NOTIFICATIONS_MANAGEMENT);
        break;

      case "13":
        handleOpenModalConfirmLogout();
        break;

      default:
        nav(Path.DASHBOARD);
        break;
    }
  };

  return (
    <div className={styles.adminSiderContainer}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          height: "100vh",
          overflow: "auto",
          scrollbarWidth: "none",
        }}
      >
        <div className={styles.logoContainer}>
          {collapsed ? (
            <div
              className={styles.openBtnContainer}
              onClick={handleToggleSider}
            >
              <TbGridDots />
            </div>
          ) : (
            <>
              <div className={clsx([styles.logo])}>
                <img
                  src="https://demo.dashboardpack.com/architectui-html-pro/assets/images/logo-inverse.png"
                  alt="Logo"
                />
              </div>
              <div className={styles.closeBtnContainer}>
                <button
                  className={styles.barsWrapper}
                  onClick={handleToggleSider}
                >
                  <FaBars />
                </button>
              </div>
            </>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={lastSelectedTabItem}
          selectedKeys={lastSelectedTabItem}
          items={items}
          onSelect={handleSelectItems}
        />
      </Sider>
      <Modal
        open={toggleModalLogout}
        maskClosable={false}
        title={
          <div
            className={clsx([
              styles.logoutModalContainer,
              "txt---600-16-20-bold",
            ])}
          >
            <Space>
              <span className={styles.iconWarn}>
                <RiErrorWarningFill />
              </span>
              Confirm logout
            </Space>
          </div>
        }
        onOk={handleConfirmLogout}
        onCancel={handleCancelModalConfirmLogout}
        okText={<span className="txt---400-14-22-regular">Log out</span>}
        cancelText={<span className="txt---400-14-22-regular">Cancel</span>}
      >
        <span className="txt---400-14-22-regular">
          Are you sure you want to log out of this account?
        </span>
      </Modal>
    </div>
  );
};

export default AdminSider;
