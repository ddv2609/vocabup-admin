import React, { ReactNode } from "react";
import { Col, Row } from "antd";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";
import CountUp from "react-countup";

import clsx from "clsx";

import styles from "./StatisticCard.module.scss";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FormattedMessage } from "react-intl";

type StatisticCardProps = {
  title?: string | ReactNode;
  icon?: React.ReactNode;
  state?: "up" | "down";
  percent?: number;
  amount?: number;
  customColor?: string;
};

const StatisticCard: React.FC<StatisticCardProps> = ({
  title = "Không xác định",
  icon = <FaRegQuestionCircle />,
  state = "up",
  percent = 0,
  amount = 0,
  customColor,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Row justify="space-between" align="top" gutter={[18, 0]}>
          <Col span={19}>
            <h4 className={clsx([styles.title, "txt---600-16-20-bold"])}>
              {title}
            </h4>
          </Col>
          <Col span={5}>
            <span
              className={styles.icon}
              style={
                customColor
                  ? {
                      color: customColor,
                    }
                  : {}
              }
            >
              {icon}
            </span>
          </Col>
        </Row>
      </div>

      <div className={styles.content}>
        <div className={clsx([styles.amount, "txt---600-28-36-bold"])}>
          <CountUp start={0} end={amount} duration={2} />
        </div>
        <div
          className={clsx([
            styles.growth,
            state === "up" ? styles.growthUp : styles.growthDown,
          ])}
        >
          <div className={styles.growthWrapper}>
            <span className={styles.icon}>
              {state === "up" ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
            </span>
            <span className={clsx([styles.percent, "txt---600-10-14-bold"])}>
              <CountUp
                start={0}
                end={percent}
                duration={2}
                decimals={2}
                suffix="%"
              />
            </span>
          </div>
          <span className={clsx([styles.compare, "txt---400-10-14-regular"])}>
            <FormattedMessage id="dashboard.compared-to-last-month" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticCard;
