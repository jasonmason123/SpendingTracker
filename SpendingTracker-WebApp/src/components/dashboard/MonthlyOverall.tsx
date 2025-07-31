import { ApexOptions } from "apexcharts";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import { statisticsApiCaller } from "../../api_caller/StatisticsApiCaller";
import Chart from "react-apexcharts";
import { IncomeExpenseResult } from "../../types";
import { ArrowDownIcon, ArrowUpIcon } from "../../icons";

// TODO: Add roll-over mechanism after each month on backend
export default function MonthlyOverall() {
  const today = new Date();
  const savingPercentage = 10;
  const oneHundredPercent = 100;
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysRemain = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const [loading, setLoading] = useState(true);
  const [loadingPrevMonth, setLoadingPrevMonth] = useState(true);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  // If remaining is negative, it represents the overspent amount
  const [remaining, setRemaining] = useState<number>(0);
  const [absoluteRemaining, setAbsoluteRemaining] = useState<number>(0);
  const [spentEarnedRatio, setSpentEarnedRatio] = useState<number>(0);
  // If dailySpending is negative, it represents minimum the amount that
  // must be made each day to balance income and expense by the end of the month
  const [dailySpending, setDailySpending] = useState<number>(0);
  const [saving, setSaving] = useState<number>(0);
  const [incomeDifference, setIncomeDifference] = useState<number>(0);
  const [expenseDifference, setExpenseDifference] = useState<number>(0);

  const calculateSaving = (income: number): number => {
    return income * (savingPercentage / oneHundredPercent);
  }

  const setCurrentIncomeExpense = async (): Promise<IncomeExpenseResult | null> => {
    if(!loading)
      setLoading(true);

    return statisticsApiCaller
      .getIncomeExpenseByPeriod(startOfMonth.toISOString(), endOfMonth.toISOString())
      .then((response) => {
        const responseIncome = response.income;
        const responseExpense = response.expense;
        
        const responseRemaining = responseIncome - responseExpense;
        const responseAbsoluteRemaining = Math.abs(responseRemaining);
        const responseRatio = responseIncome === 0 ? 0 : (responseExpense / responseIncome) * oneHundredPercent;

        // If spending/income exceeds saving amount then saving is 0
        const savingAmount = responseRatio <= (oneHundredPercent - savingPercentage) ?
          calculateSaving(responseIncome) : 0;
        
        const dailySpendingAmount = daysRemain > 0
          ? (responseRemaining - savingAmount) / daysRemain
          : 0;

        setIncome(responseIncome);
        setExpense(responseExpense);
        setRemaining(responseRemaining);
        setAbsoluteRemaining(responseAbsoluteRemaining);
        setSpentEarnedRatio(responseRatio);
        setSaving(savingAmount);
        setDailySpending(dailySpendingAmount);

        return {
          income: responseIncome,
          expense: responseExpense,
        };
      })
      .catch((err) => {
        console.error("Failed to fetch income/expense", err);
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const setIncomeExpenseDiff = async (
    currentIncome: number,
    currentExpense: number
  ) => {
    // No compare to previous months if current month has no any income or expense
    if(currentIncome === 0 && currentExpense === 0)
      return;
    
    if(!loadingPrevMonth)
      setLoadingPrevMonth(true);
    
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    try {
      const response = await statisticsApiCaller.getIncomeExpenseByPeriod(
        startOfPrevMonth.toISOString(),
        endOfPrevMonth.toISOString()
      );

      const resPrevIncome = response.income;
      const resPrevExpense = response.expense;

      setIncomeDifference(currentIncome - resPrevIncome);
      setExpenseDifference(currentExpense - resPrevExpense);
    } catch (err) {
      console.error("Failed to fetch income/expense differences", err);
    } finally {
      setLoadingPrevMonth(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const current = await setCurrentIncomeExpense();
      if(current != null) {
        await setIncomeExpenseDiff(current?.income, current?.expense);
      }
    };
    fetchData();
  }, []);

  const colorSpending = "#F87171";
  const colorEarning = "#60A5FA";

  const series = [spentEarnedRatio];
  const options: ApexOptions = {
    colors: [colorSpending],
    chart: {
      fontFamily: "Nunito, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: colorEarning,
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "24px",
            fontWeight: "600",
            offsetY: -40,
            color: colorSpending,
            formatter: function() {
              return absoluteRemaining.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND"
              })
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [colorSpending],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Đã chi"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
      {/* Header: Current Month */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
          Tổng quan thu chi tháng {today.getMonth() + 1}/{today.getFullYear()}
        </h4>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Side: Chart */}
        <div className="flex flex-col items-center">
          {loading ? (
            <div className="h-[330px] flex items-center justify-center">Đang tải...</div>
          ) : (
            <>
              <div className="relative">
                <div className="max-h-[330px]" id="chartDarkStyle">
                    <Chart
                      options={options}
                      series={series}
                      type="radialBar"
                      height={330}
                    />
                </div>

                <span className={`absolute left-1/2 top-1/2 px-3 py-1 -translate-x-1/2
                  -translate-y-[50%] text-sm font-medium text-gray-500 dark:text-gray-400
                  ${remaining >= 0 ? "text-blue-500 dark:text-blue-400" : "text-error-600 dark:text-error-500"}`}
                >
                  {remaining >= 0 ? "Còn lại" : "Đã quá hạn mức"}
                </span>
              </div>

              <p className="mt-5 text-center text-sm text-gray-500 sm:text-base">
                {spentEarnedRatio <= 60 && spentEarnedRatio > 0
                  ? "Chi tiêu tháng này vẫn trong giới hạn. Hãy cố gắng tiết kiệm phần còn lại nếu có thể."
                  : spentEarnedRatio > 60 && spentEarnedRatio < 100
                  ? "Bạn sắp chạm ngưỡng chi tiêu tháng này, hãy tiết kiệm hơn. Cân nhắc tăng thêm thu nhập nếu có thể."
                  : "Bạn đã vượt ngưỡng chi tiêu tháng này, hãy hạn chế chi tiêu và tìm cơ hội gia tăng thu nhập."}
              </p>
            </>
          )}
        </div>

        {/* Right Side: Metrics */}
        <div className="space-y-4">
          {/* Income */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Thu nhập</span>
              <h4 className="mt-1 font-bold text-blue-600 dark:text-blue-500">
                {income.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </h4>
            </div>
            {!loadingPrevMonth && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                <div>So với tháng trước:</div>
                {incomeDifference < 0 ? (
                  <Badge color="error" className="inline-flex items-center gap-1 mt-1" size="sm">
                    <ArrowDownIcon />
                    {Math.abs(incomeDifference).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Badge>
                ) : (
                  <Badge color="primary" className="inline-flex items-center gap-1 mt-1" size="sm">
                    <ArrowUpIcon />
                    {incomeDifference.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Spending */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Chi tiêu</span>
              <h4 className="mt-1 font-bold text-error-600 dark:text-error-500">
                {expense.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </h4>
            </div>
            {!loadingPrevMonth && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                <div>So với tháng trước:</div>
                {expenseDifference < 0 ? (
                  <Badge color="primary" className="inline-flex items-center gap-1 mt-1" size="sm">
                    <ArrowDownIcon />
                    {Math.abs(expenseDifference).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Badge>
                ) : (
                  <Badge color="error" className="inline-flex items-center gap-1 mt-1" size="sm">
                    <ArrowUpIcon />
                    {expenseDifference.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Remaining */}
          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-sm font-medium text-gray-700 dark:text-white/90">
              {remaining >= 0 ? "Còn lại" : "Đã quá hạn mức"}
            </span>
            <span className={`font-semibold
              ${remaining > 0 ? "text-blue-600 dark:text-blue-500" :
                "text-error-600 dark:text-error-500"}`}
            >
              {absoluteRemaining.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Extra Fields */}
      {!loading && (
        <div className="mt-6 text-center">
          <h3 className="text-base font-semibold text-gray-700 dark:text-white mb-2">
            Khuyến nghị
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 text-center border-t pt-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="mt-4 md:mt-0">
              <span className="text-xs">
                {dailySpending < 0 ? "Trung bình cần tiết kiệm" : "Mức an toàn có thể chi"}
              </span>
              <div className="font-medium text-gray-800 dark:text-white/90">
                {Math.abs(dailySpending).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })} / ngày
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="text-xs">Tháng {today.getMonth() + 1} còn</span>
              <div className="font-medium text-gray-800 dark:text-white/90">
                {daysRemain <= 1 ? "Hôm nay" : `${daysRemain} ngày`}
              </div>
            </div>
            {spentEarnedRatio <= (oneHundredPercent - savingPercentage) ? (
              <div className="mt-4 md:mt-0">
                <span className="text-xs">
                    Mục tiêu tiết kiệm ({savingPercentage}% thu nhập)
                </span>
                <div className="font-medium text-gray-800 dark:text-white/90">
                  {saving.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </div>
              </div>
            ) : spentEarnedRatio <= oneHundredPercent ? (
              <div className="mt-4 md:mt-0">
                <span className="text-xs">
                  Mức nên kiếm thêm
                </span>
                <div className="font-medium text-gray-800 dark:text-white/90">
                  {(calculateSaving(income) / daysRemain).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })} / ngày
                </div>
              </div>
            ) : (
              <div className="mt-4 md:mt-0">
                <span className="text-xs">
                  Tiến độ hồi phục
                </span>
                <div className="font-medium text-gray-800 dark:text-white/90">
                  Còn {Math.abs(remaining).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}