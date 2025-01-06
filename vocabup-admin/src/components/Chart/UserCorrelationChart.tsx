import React, { useEffect, useState } from "react";

import styles from "./UserCorrelationChart.module.scss";
import HighchartsReact from "highcharts-react-official";
import HighChart3D from "highcharts/highcharts-3d";
import { TypeStatisticQuery } from "../../service/statisticService";
import { StatisticService } from "../../service";
import { useIntl } from "react-intl";

const Months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const UserCorrelationChart: React.FC = () => {
  const intl = useIntl();
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "column",
      options3d: {
        enabled: true,
        alpha: 10,
        beta: 25,
        depth: 70,
      },
      style: {
        lineWidth: 0,
        fontFamily: `"Muli", -apple-system, BlinkMacSystemFont, "Segoe UI", 
          Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, 
          "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      },
    },
    credits: {
      enabled: false,
    },
    title: {
      useHTML: true,
      text: `<span className="txt---600-18-22-bold">
          ${intl.formatMessage({
            id: "dashboard.new-users-between-months",
          })}
        </span>`,
    },
    subtitle: {
      text: "Năm 2024",
    },
    plotOptions: {
      column: {
        depth: 25,
      },
    },
    xAxis: {
      type: "category",
      labels: {
        skew3d: true,
        style: {
          fontSize: "16px",
        },
      },
    },
    yAxis: {
      title: {
        useHTML: true,
        text: `<span className="txt---400-12-16-regular">
              ${intl.formatMessage({
                id: "dashboard.new-users",
              })} (${intl.formatMessage({ id: "dashboard.user-unit" })})
          </span>`,
      },
      allowDecimals: false,
    },
    tooltip: {
      valueSuffix: ` ${intl.formatMessage({
        id: "dashboard.user-unit",
      })}`,
    },
    series: [
      {
        name: intl.formatMessage({ id: "dashboard.total-new-users" }),
        data: [
          ["January", 21],
          ["February", 42],
          ["March", 23],
          ["April", 6],
          ["May", 54],
          ["June", 89],
          ["July", 12],
          ["August", 2],
          ["September", 10],
          ["October", 76],
          ["November", 69],
          ["December", 1],
        ],
      },
    ],
  });

  const loadNewUserStatisticInOneYear = async (type: TypeStatisticQuery) => {
    const { data: response, status } =
      await StatisticService.getStatisticsInOneYear(type);

    if (status < 400) {
      setChartOptions((prev) => ({
        ...prev,
        series: [
          {
            ...prev.series[0],
            data: response.data.map((d: { [key: string]: number | string }) => [
              Months[(d.month as number) - 1],
              d.count,
            ]),
          },
        ],
      }));
    }
  };

  useEffect(() => {
    loadNewUserStatisticInOneYear("NEWUSER");
  }, []);

  return (
    <div className={styles.userCorrelationChartContainer}>
      <div className={styles.chartsContainer}>
        <HighchartsReact highcharts={HighChart3D} options={chartOptions} />
      </div>
    </div>
  );
};

export default UserCorrelationChart;
