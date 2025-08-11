import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { statisticsApiCaller } from "../../api_caller/StatisticsApiCaller";
import { useEffect, useState } from "react";
import Select from "../form/Select";

export default function StatisticsChart() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const monthSeries = Array.from({ length: 12 }, (_, i) =>
    `${String(i + 1).padStart(2, "0")}/${currentYear}`
  );
  const yearOptions: { value: string; label: string }[] = 
    Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return {
        value: year.toString(),
        label: year.toString(),
      };
    });

  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [series, setSeries] = useState<{
    name: string,
    data: number[]
  }[]>([]);

  const getData = async (year: number) => {
    setLoading(true);
    await statisticsApiCaller.getMonthlyAmountsByYear(year)
      .then((result) => {
        let incomeData: number[] = [];
        let expenseData: number[] = [];
        
        const monthlyIncomes = new Map<number, number>(
          Object.entries(result.monthlyIncomes).map(([key, value]) => [parseInt(key), value as number])
        );

        const monthlyExpenses = new Map<number, number>(
          Object.entries(result.monthlyExpenses).map(([key, value]) => [parseInt(key), value as number])
        );
        
        for (let index = 0; index < 12; index++) {
          const month = index + 1;
          incomeData.push(monthlyIncomes.get(month) as number);
          expenseData.push(monthlyExpenses.get(month) as number);
        };

        const newSeries = [
          {
            name: "Thu nhập",
            data: incomeData,
          },
          {
            name: "Chi tiêu",
            data: expenseData,
          }
        ];

        setSeries(newSeries);
      })
      .catch((err) => {
        console.error("Failed to fetch monthly amounts by year", err);
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    getData(selectedYear);
  }, [selectedYear]);

  const colorSpending = "#F87171";
  const colorEarning = "#60A5FA";

  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: [colorEarning, colorSpending], // Define line colors
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: "straight", // Define the line style (straight, smooth, or step)
      width: [2, 2], // Line width for each dataset
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      x: {
        format: "dd MMM yyyy", // Format for x-axis tooltip
      },
    },
    xaxis: {
      type: "category", // Category-based x-axis
      categories: monthSeries,
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
        formatter: (value) => {
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
          }).format(value);
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Thống kê theo năm
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Thống kê thu chi theo năm
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <Select
            options={yearOptions}
            placeholder="Chọn năm"
            defaultValue={selectedYear + ""}
            className="w-32"
            onChange={(value) => {
              const chosenYear: number = Number.parseInt(value);
              setSelectedYear(chosenYear);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="h-[330px] flex items-center justify-center">Đang tải...</div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
