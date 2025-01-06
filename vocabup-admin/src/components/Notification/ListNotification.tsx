import React, { useState } from "react";
import styles from "./ListNotification.module.scss";
import { AppNotification } from "../../types/notification";
import { Avatar, Button, Dropdown, MenuProps } from "antd";
import { FaUserAlt } from "react-icons/fa";
import clsx from "clsx";
import moment from "moment";
import { HiDotsHorizontal } from "react-icons/hi";
import { MenuInfo } from "rc-menu/lib/interface";

type ListNotificationProps = {
  notifications: AppNotification[];
  hasNext: boolean;
  getExtraNotification: () => Promise<void>;
  handleDeleteNotification: (notificationId: string) => Promise<void>;
};

const ListNotification: React.FC<ListNotificationProps> = ({
  notifications,
  hasNext,
  getExtraNotification,
  handleDeleteNotification,
}) => {
  const [hoverNotification, setHoverNotification] = useState<string | null>();

  const itemActions: MenuProps["items"] = [
    {
      key: "edit",
      label: <span className={"txt---400-12-16-regular"}>Edit</span>,
    },
    {
      key: "delete",
      label: <span className={"txt---400-12-16-regular"}>Delete</span>,
    },
  ];

  const handleSelectAction = ({ key }: MenuInfo, notificationId: string) => {
    switch (key) {
      case "edit":
        // TODO: Handle edit notification
        break;
      case "delete":
        handleDeleteNotification(notificationId);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.listNotificationsContainer}>
      {notifications.map((notification) => (
        <div
          className={styles.itemWrapper}
          key={notification._id}
          onMouseEnter={() => setHoverNotification(() => notification._id)}
          onMouseLeave={() => setHoverNotification(() => null)}
        >
          <div className={styles.avatarWrapper}>
            <Avatar
              shape="circle"
              size={54}
              src={notification.sender.avatar || null}
              icon={<FaUserAlt />}
            />
          </div>
          <div className={styles.detailInfoContainer}>
            <div
              className={clsx(["txt---600-12-16-bold", styles.senderName])}
            >{`${notification.sender.fullName.firstName} ${notification.sender.fullName.lastName}`}</div>
            <div
              className={clsx(["txt---400-12-16-regular", styles.content])}
              title={notification.message}
            >
              <strong>{notification.title} </strong>
              {notification.message}
            </div>

            <div className={clsx([styles.dateTime, "txt---600-12-16-bold"])}>
              <span className={styles.createdAt}>
                Posted: {moment(notification.createdAt).format("DD/MM/YYYY")}
              </span>
              {notification.createdAt !== notification.updatedAt ? (
                <span className={styles.updatedAt}>
                  Updated: {moment(notification.updatedAt).format("DD/MM/YYYY")}
                </span>
              ) : (
                <></>
              )}
            </div>
          </div>
          {hoverNotification === notification._id && (
            <div className={styles.actionBtn}>
              <Dropdown
                menu={{
                  items: itemActions,
                  onClick: (info) => handleSelectAction(info, notification._id),
                }}
                placement="bottom"
                trigger={["click", "hover"]}
              >
                <Button
                  icon={<HiDotsHorizontal />}
                  shape="circle"
                  size="small"
                />
              </Dropdown>
            </div>
          )}
        </div>
      ))}

      {hasNext && (
        <Button type="default" onClick={getExtraNotification}>
          Hiển thị thêm thông báo
        </Button>
      )}
    </div>
  );
};

export default ListNotification;
