import { Layout } from "antd";
import React, { useState } from "react";
import {
  FaChartBar,
  // FaCheckToSlot,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa6";
import { HiUserGroup } from "react-icons/hi";

// import { Outlet } from "react-router-dom";
import AdminSider from "../../components/Layout/AdminSider/AdminSider";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { Content, Footer, Header } from "antd/es/layout/layout";

import styles from "./Home.module.scss";
import clsx from "clsx";
import { LuWholeWord } from "react-icons/lu";
import { PiBookBookmarkFill } from "react-icons/pi";
import { IoMdSettings } from "react-icons/io";
import { FaInfoCircle } from "react-icons/fa";
import { IoChatbubblesSharp, IoNotificationsSharp } from "react-icons/io5";
import { AiOutlineLogout } from "react-icons/ai";
import { MdManageHistory, MdReportProblem } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { RiArticleFill } from "react-icons/ri";
import AdminHeader from "../../components/Layout/Header/AdminHeader";
import { FormattedMessage } from "react-intl";

type HomeProps = {
  children: string | JSX.Element | JSX.Element[];
};

const Home: React.FC<HomeProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const itemsMenu: ItemType<MenuItemType>[] = [
    {
      key: "features",
      label: (
        <span className="txt---400-12-16-regular">
          <FormattedMessage id="menu.features" />
        </span>
      ),
      type: "group",
      children: [
        {
          key: "1",
          icon: <FaChartBar />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.dashboard" />
            </span>
          ),
        },
        {
          key: "2",
          icon: <HiUserGroup />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.list-of-members" />
            </span>
          ),
          children: [
            {
              key: "2.1",
              icon: <FaUserTie />,
              label: (
                <span className="txt---400-14-18-regular">
                  <FormattedMessage id="menu.users" />
                </span>
              ),
            },
            {
              key: "2.2",
              icon: <FaUserShield />,
              label: (
                <span className="txt---400-14-18-regular">
                  <FormattedMessage id="menu.admins" />
                </span>
              ),
            },
          ],
        },
        {
          key: "3",
          icon: <BiSolidCategoryAlt />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.list-of-topics" />
            </span>
          ),
        },
        {
          key: "4",
          icon: <LuWholeWord />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.list-of-words" />
            </span>
          ),
        },
        {
          key: "5",
          icon: <PiBookBookmarkFill />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.list-of-stages" />
            </span>
          ),
        },
        {
          key: "6",
          icon: <RiArticleFill />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.list-of-blogs" />
            </span>
          ),
        },
      ],
    },
    {
      key: "app",
      label: (
        <span
          className={`txt---400-12-16-regular d-ib w-100 ${
            collapsed ? "text-center" : ""
          }`}
        >
          <FormattedMessage id="menu.app" />
        </span>
      ),
      type: "group",
      children: [
        {
          key: "7",
          icon: <IoMdSettings />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.setting" />
            </span>
          ),
        },
        {
          key: "8",
          icon: <IoChatbubblesSharp />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.chat" />
            </span>
          ),
        },
        {
          key: "9",
          icon: <FaInfoCircle />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.personal-info" />
            </span>
          ),
        },
        {
          key: "10",
          icon: <MdReportProblem />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.reports" />
            </span>
          ),
        },
        {
          key: "11",
          icon: <MdManageHistory />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.history" />
            </span>
          ),
        },
        {
          key: "12",
          icon: <IoNotificationsSharp />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.notification" />
            </span>
          ),
        },
        {
          key: "13",
          icon: <AiOutlineLogout />,
          label: (
            <span className="txt---400-14-18-regular">
              <FormattedMessage id="menu.log-out" />
            </span>
          ),
        },
      ],
    },
  ];

  return (
    <div className={styles.adminPageContainer}>
      <Layout>
        <AdminSider
          items={itemsMenu}
          collapsed={collapsed}
          handleToggleSider={() => setCollapsed(!collapsed)}
        />
        <Layout
          style={{
            maxHeight: "100vh",
          }}
        >
          <Header className={styles.headerContainer}>
            <AdminHeader />
          </Header>
          <Content className={styles.contentContainer}>{children}</Content>
          <Footer
            className={clsx([styles.footerContainer, "txt---600-16-20-bold"])}
          >
            © 2024. All Rights Reserved. VocabUp.
          </Footer>
        </Layout>
      </Layout>
    </div>
  );
};

export default Home;
