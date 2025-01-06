import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import styles from "./SpinInContainer.module.scss";

const SpinInContainer: React.FC = () => {
  return (
    <div className={styles.overlay}>
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 48,
            }}
            spin
          />
        }
      />
    </div>
  );
};

export default SpinInContainer;
