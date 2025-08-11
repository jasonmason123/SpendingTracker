import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { statisticsApiCaller } from "../../api_caller/StatisticsApiCaller";

export default function ExpenseByCategoryChart() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    await statisticsApiCaller.getExpenseByCategoryCustomRange(
      firstDay.toISOString(),
      lastDay.toISOString()
    )
      .then((result) => {
        const labels = Object.keys(result);
        const series = Object.values(result);

        setLabels(labels);
        setSeries(series);
      })
      .catch((err) => {
        console.error("Failed to fetch expense by category", err);
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const formatterVND = (value: number) =>
    value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const options: ApexOptions = {
    chart: {
      type: "pie",
      toolbar: {
        show: true
      }
    },
    series: series,
    labels: labels,
    legend: {
      position: "right",
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: formatterVND,
      }
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Cơ cấu chi tiêu theo danh mục
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Tháng {today.getMonth() + 1}/{today.getFullYear()}
        </p>
      </div>

      {loading ? (
        <div className="h-[330px] flex items-center justify-center">Đang tải...</div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <Chart options={options} series={series} type="pie" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}