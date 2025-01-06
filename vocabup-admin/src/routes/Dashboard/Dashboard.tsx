// import React, { SyntheticEvent, useState } from "react";
import React, { useEffect, useMemo, useState } from "react";

import styles from "./Dashboard.module.scss";
import StatisticCard from "../../components/StatisticCard/StatisticCard";
import { Col, Row } from "antd";
import { FaUserAlt } from "react-icons/fa";
// import { PiBookBookmarkFill, PiBooksFill } from "react-icons/pi";
import { PiBooksFill } from "react-icons/pi";
// import { IoTimer } from "react-icons/io5";
import { BsPostcardHeartFill } from "react-icons/bs";
import NewUserChart from "../../components/Chart/NewUserChart";
import NewPostChart from "../../components/Chart/NewPostChart";
import UserCorrelationChart from "../../components/Chart/UserCorrelationChart";
import PostCorrelationChart from "../../components/Chart/PostCorrelationChart";
import { StatisticService } from "../../service";
import { FormattedMessage } from "react-intl";

type GeneralStatistic = {
  id: string;
  title: string | React.ReactNode;
  icon: React.ReactNode;
  state: "up" | "down";
  percent: number;
  amount: number;
};

const generateId = () => `${Math.random().toString(36)}-${Date.now()}`;

const Dashboard: React.FC = () => {
  const [generalStats, setGeneralStats] = useState<{ [key: string]: number }>(
    {}
  );

  const calculateState = (current: number, last: number) =>
    current < last ? "down" : "up";
  const calculatePercent = (current: number, last: number) =>
    parseFloat(((100 * (current + last || 0)) / (last || 1)).toFixed(2));

  const generalStatistics = useMemo<GeneralStatistic[]>(
    () => [
      {
        id: generateId(),
        title: <FormattedMessage id="dashboard.new-users" />,
        icon: <FaUserAlt />,
        state: calculateState(
          generalStats.newUserCurrMonth,
          generalStats.newUserLastMonth
        ),
        percent: calculatePercent(
          generalStats.newUserCurrMonth,
          generalStats.newUserLastMonth
        ),
        amount: generalStats.newUserCurrMonth || 0,
      },
      {
        id: generateId(),
        title: <FormattedMessage id="dashboard.new-words" />,
        icon: <PiBooksFill />,
        state: calculateState(
          generalStats.newWordCurrMonth,
          generalStats.newWordLastMonth
        ),
        percent: calculatePercent(
          generalStats.newWordCurrMonth,
          generalStats.newWordLastMonth
        ),
        amount: generalStats.newWordCurrMonth || 0,
      },
      // {
      //   id: generateId(),
      //   title: "Thời gian dùng ứng dụng",
      //   icon: <IoTimer />,
      //   state: "up",
      //   percent: 20.1,
      //   amount: 25,
      // },
      // {
      //   id: generateId(),
      //   title: "Số lượng bài học người dùng hoàn thành",
      //   icon: <PiBookBookmarkFill />,
      //   state: "down",
      //   percent: 31.1,
      //   amount: 345,
      // },
      {
        id: generateId(),
        title: <FormattedMessage id="dashboard.new-posts" />,
        icon: <BsPostcardHeartFill />,
        state: calculateState(
          generalStats.newPostCurrMonth,
          generalStats.newPostLastMonth
        ),
        percent: calculatePercent(
          generalStats.newPostCurrMonth,
          generalStats.newPostLastMonth
        ),
        amount: generalStats.newPostCurrMonth || 0,
      },
    ],
    [generalStats]
  );

  const loadGeneralStatistic = async () => {
    const { data: response, status } =
      await StatisticService.getGeneralStatistic();

    if (status < 400) {
      setGeneralStats(response.data);
    }
  };

  useEffect(() => {
    loadGeneralStatistic();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.generalStatisticsContainer}>
        <Row gutter={[24, 24]} align={"middle"}>
          {generalStatistics.map((item) => (
            <Col key={item.id}>
              <StatisticCard
                title={item.title}
                icon={item.icon}
                state={item.state}
                percent={item.percent}
                amount={item.amount}
              />
            </Col>
          ))}
        </Row>
      </div>

      <div className={styles.chartsContainer}>
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <NewUserChart />
          </Col>
          <Col span={12}>
            <UserCorrelationChart />
          </Col>
        </Row>
        <Row gutter={[16, 0]}>
          <Col span={12}>
            <NewPostChart />
          </Col>
          <Col span={12}>
            <PostCorrelationChart />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;
