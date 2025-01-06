import React from "react";

import styles from "./NotificationsManagement.module.scss";
import { Col, Row } from "antd";
import FilterNotifications from "../../components/Notification/FilterNotifications";
import PushNotification from "../../components/Notification/PushNotification";

const NotificationsManagement: React.FC = () => {
  return (
    <div className={styles.notificationsManagementContainer}>
      <Row gutter={[16, 16]} className={styles.notificationsManagementWrapper}>
        <Col span={14} className={styles.pushNotificationsWrapper}>
          <PushNotification />
        </Col>
        <Col span={10} className={styles.viewNotificationsWrapper}>
          <FilterNotifications />
        </Col>
      </Row>
    </div>
  );
};

export default NotificationsManagement;
