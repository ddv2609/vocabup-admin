import React, { useEffect, useState } from "react";
import HighChart from "highcharts";

import styles from "./NewUserChart.module.scss";
import HighchartsReact from "highcharts-react-official";
import clsx from "clsx";
import {
  TypeDateQuery,
  TypeStatisticQuery,
} from "../../service/statisticService";
import { StatisticService } from "../../service";
import moment from "moment";
import { FormattedMessage, useIntl } from "react-intl";

const generateData = (
  days: number,
  startValue: number,
  fluctuation: number
) => {
  const data = [];
  let currentValue = startValue;

  for (let i = 0; i < days; i++) {
    const timestamp = Date.UTC(2024, 11, i + 1); // Tháng 12, từ ngày 1 đến 30
    currentValue += Math.floor(Math.random() * fluctuation * 2) - fluctuation; // Thay đổi giá trị ngẫu nhiên trong khoảng +-fluctuation
    currentValue = Math.max(50, Math.min(350, currentValue)); // Giới hạn giá trị trong khoảng 50 đến 350
    data.push([timestamp, currentValue]);
  }

  return data;
};

const NewUserChart: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TypeDateQuery>("1M");
  const intl = useIntl();

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: "areaspline",
      backgroundColor: null,
      plotBorderWidth: 0,
      plotShadow: false,
      style: {
        lineWidth: 0,
        fontFamily: `"Muli", -apple-system, BlinkMacSystemFont, "Segoe UI", 
          Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, 
          "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
      },
      // width: "100%",
      height: 358,
    },
    time: {
      useUTC: true,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: "",
      align: "center",
      verticalAlign: "middle",
    },
    xAxis: {
      type: "datetime",
      title: {
        enabled: false,
      },
      tickInterval: 10 * 24 * 3600 * 1000,
      labels: {
        format: "{value:%d/%m}",
      },
      lineWidth: 1,
      lineColor: "var(--action-hover-color-bg)",
      axisLineWidth: 1,
      axisLineColor: "var(--action-hover-color-bg)",
      tickWidth: 0,
      crosshair: {
        width: 1,
        color: "var(--primary-color)",
        dashStyle: "dash",
        zIndex: 2,
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
      lineWidth: 1,
      lineColor: "var(--action-hover-color-bg)",
      gridLineColor: "var(--action-hover-color-bg)",
      gridLineWidth: 1,
      tickWidth: 0,
      // tickInterval: 2000,
      allowDecimals: false,
    },

    tooltip: {
      useHTML: true,
      borderRadius: 8,
      borderWidth: 0,
      backgroundColor: "var(--bg-light)",
      shape: "square",
      valueSuffix: ` ${intl.formatMessage({
        id: "dashboard.user-unit",
      })}`,
      // formatter: function () {
      //   return `
      //     <div class="tooltip-wrapper">
      //       <div class="tooltip-date">${Highcharts.dateFormat(
      //         "%d/%m/%Y",
      //         this.x
      //       )}</div>
      //       <span class="tooltip-nav">NAV:</span>
      //       <span class="tooltip-nav-val">${NumberFormatUtils.formatPrice(
      //         this.y
      //       )} Tỷ</span>
      //     </div>
      //   `;
      // },
      // positioner: function (labelWidth, labelHeight, point) {
      //   // Tính toán vị trí tooltip
      //   const chartWidth = this.chart.chartWidth; // Tổng chiều rộng của biểu đồ
      //   const tooltipXRight =
      //     this.chart.plotLeft + point.plotX + 16 + labelWidth; // Vị trí nếu hiển thị bên phải
      //   const tooltipXLeft =
      //     this.chart.plotLeft + point.plotX - 16 - labelWidth; // Vị trí nếu hiển thị bên trái

      //   // Kiểm tra nếu tooltip vượt quá biên phải của biểu đồ
      //   const tooltipX =
      //     tooltipXRight > chartWidth
      //       ? tooltipXLeft
      //       : this.chart.plotLeft + point.plotX + 16;

      //   // Vị trí Y, căn giữa theo chiều cao
      //   const tooltipY =
      //     this.chart.plotTop + point.plotY - (labelHeight * 4) / 5;

      //   return {
      //     x: tooltipX,
      //     y: tooltipY,
      //   };
      // },
    },
    plotOptions: {
      areaspline: {
        allowPointSelect: true,
        cursor: "pointer",
        smooth: true,
        dataLabels: {
          enabled: false,
        },
        marker: {
          enabled: false,
          radius: 6,
          fillColor: "var(--primary-color)",
          lineColor: "var(--bg-light)",
          lineWidth: 2,
        },
        point: {
          events: {},
        },
        fillColor: {
          linearGradient: [0, 0, 0, 358],
          stops: [
            [0, "var(--primary-color)"],
            [1, "var(--chart-blur-color)"],
          ],
        },
      },
    },
    legend: {
      enabled: true,
    },
    series: [
      {
        name: intl.formatMessage({
          id: "dashboard.new-users",
        }),
        data: generateData(30, 150, 100),
        color: "var(--primary-color)",
      },
    ],
  });

  const loadNewUserStatisticByMonths = async (
    type: TypeStatisticQuery,
    timeRange: TypeDateQuery
  ) => {
    const { data: response, status } =
      await StatisticService.getStatisticsByMonths(type, timeRange);

    if (status < 400) {
      setChartOptions((prev) => ({
        ...prev,
        series: [
          {
            ...prev.series[0],
            data: response.data.map((d: { [key: string]: string | number }) => [
              moment(d.date, "YYYY-MM-DD").utc(true).valueOf(),
              d.count,
            ]),
          },
        ],
      }));
    }
  };

  useEffect(() => {
    loadNewUserStatisticByMonths("NEWUSER", selectedTimeRange);
  }, [selectedTimeRange]);

  return (
    <div className={styles.newUserChartContainer}>
      <div className={styles.chartHeader}>
        <div className="txt---600-18-22-bold">
          <FormattedMessage id="dashboard.new-users-by-day" />
        </div>
        <div className={styles.timeRanges}>
          {["1M", "3M", "6M", "9M", "1Y"].map((time: string) => (
            <div
              key={time}
              className={clsx([
                styles.timeItem,
                selectedTimeRange === time ? styles.active : "",
              ])}
              onClick={() => setSelectedTimeRange(time as TypeDateQuery)}
            >
              {time}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.chartsContainer}>
        <HighchartsReact highcharts={HighChart} options={chartOptions} />
      </div>
    </div>
  );
};

export default NewUserChart;
