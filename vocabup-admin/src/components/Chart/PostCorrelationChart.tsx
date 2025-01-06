import React, { useEffect, useState } from "react";

import styles from "./PostCorrelationChart.module.scss";
import HighchartsReact from "highcharts-react-official";
import HighChart from "highcharts";
import { TypeStatisticQuery } from "../../service/statisticService";
import { StatisticService } from "../../service";
import { useIntl } from "react-intl";

// function generateMonthData(values: number[]) {
//   return values.map((value, index) => {
//     // Chuyển đổi ngày của tháng (1-31) sang timestamp UTC cho mỗi ngày.
//     return [index + 1, value];
//   });
// }

const PostCorrelationChart: React.FC = () => {
  const intl = useIntl();
  const [chartOptions, setChartOptions] = useState({
    chart: {
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
          ${intl.formatMessage({ id: "dashboard.correlation-of-posts" })}
        </span>`,
    },

    yAxis: {
      title: {
        useHTML: true,
        text: `<span className="txt---400-12-16-regular">
            ${intl.formatMessage({
              id: "dashboard.new-posts",
            })} (${intl.formatMessage({ id: "dashboard.post-unit" })})
          </span>`,
      },
      allowDecimals: false,
    },

    xAxis: {
      title: {
        text: intl.formatMessage({ id: "dashboard.day-of-the-month" }),
      },
      categories: Array.from({ length: 31 }, (_, i) => i + 1), // Danh sách ngày từ 1 đến 31
      labels: {
        style: {
          fontSize: "14px",
        },
      },
    },

    tooltip: {
      headerFormat: "{point.x} - {series.name}<br>",
      valueSuffix: " bài",
    },

    legend: {
      align: "center",
    },

    plotOptions: {
      series: {
        label: {
          connectorAllowed: false,
        },
        // pointStart: 2010,
      },
    },

    series: [],

    // responsive: {
    //   rules: [
    //     {
    //       condition: {
    //         maxWidth: 500,
    //       },
    //       chartOptions: {
    //         legend: {
    //           layout: "horizontal",
    //           align: "center",
    //           verticalAlign: "bottom",
    //         },
    //       },
    //     },
    //   ],
    // },
  });

  const loadNewPostStatisticInOneYear = async (type: TypeStatisticQuery) => {
    const { data: response, status } =
      await StatisticService.getStatisticsInOneYear(type);

    if (status < 400) {
      setChartOptions((prev) => ({
        ...prev,
        series: response.data.map((d: { [key: string]: string }) => ({
          name: d.month,
          data: d.data,
        })),
      }));
    }
  };

  useEffect(() => {
    loadNewPostStatisticInOneYear("NEWPOST");
  }, []);

  return (
    <div className={styles.postCorrelationChartContainer}>
      <HighchartsReact highcharts={HighChart} options={chartOptions} />
    </div>
  );
};

export default PostCorrelationChart;
