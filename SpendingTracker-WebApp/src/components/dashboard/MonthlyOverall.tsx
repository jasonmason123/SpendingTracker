import { ApexOptions } from "apexcharts";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import { statisticsApiCaller } from "../../api_caller/StatisticsApiCaller";
import Chart from "react-apexcharts";
import { ArrowDownIcon, ArrowUpIcon, InfoIcon } from "../../icons";
import Tippy from "@tippyjs/react";
import { PeriodUnit } from "../../types";

export default function MonthlyOverall() {
  const today = new Date();
  const savingPercentage = 10;
  const oneHundredPercent = 100;
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysRemain = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  // If this is negative, it represents the overspent amount, else, remaining amount
  const [incomeExpenseDiff, setIncomeExpenseDiff] = useState<number>(0);
  const [absoluteIncomeExpenseDiff, setAbsoluteIncomeExpenseDiff] = useState<number>(0);
  const [spentEarnedRatio, setSpentEarnedRatio] = useState<number>(0);
  const [rollover, setRollover] = useState<number>(0);
  // If dailySpending is negative, it represents minimum the amount that
  // must be made each day to balance income and expense by the end of the month
  const [dailyAmount, setDailyAmount] = useState<number>(0);
  const [saving, setSaving] = useState<number>(0);
  const [incomeDifference, setIncomeDifference] = useState<number>(0);
  const [expenseDifference, setExpenseDifference] = useState<number>(0);

  function calculateSaving(income: number): number {
    return income * (savingPercentage / oneHundredPercent);
  }

  function calculateExpenseIncomeRatio(income: number, expense: number, rollover: number): number {
    // If rollover is negative, it adds to expense
    const adjustedExpense = expense + (rollover < 0 ? Math.abs(rollover) : 0);
    // If rollover is positive, it adds to income
    const adjustedIncome = income + (rollover > 0 ? rollover : 0);

    // Prevent division by zero
    if (adjustedIncome === 0) {
      if(adjustedExpense > 0)
        return 1.1;
      return 0;
    }

    return adjustedExpense / adjustedIncome;
  }

  const getSetData = async () => {
    if(!loading)
      setLoading(true);

    await statisticsApiCaller
      .getIncomeExpenseSummary(new Date().toISOString(), PeriodUnit.MONTH, true)
      .then((response) => {
        console.log("Response summary", response);

        const responseIncome = response.income;
        const responseExpense = response.expense;
        const responseRollover = response.rollover;
        
        const responseRatio = calculateExpenseIncomeRatio(responseIncome, responseExpense, responseRollover) * oneHundredPercent;

        const responseIncomeExpenseDiff = (responseIncome - responseExpense) + responseRollover;

        // If spending/income exceeds saving amount then saving is 0
        // Include rollover into income if rollover > 0 (leftover amount from previous month)
        const savingAmount = responseRatio <= (oneHundredPercent - savingPercentage) ?
          calculateSaving(responseIncome + (responseRollover > 0 ? responseRollover : 0)) : 0;
        
        const responseDailyAmount = daysRemain > 0
          ? (responseIncomeExpenseDiff - savingAmount) / daysRemain
          : 0;

        setIncome(responseIncome);
        setExpense(responseExpense);
        setIncomeExpenseDiff(responseIncomeExpenseDiff);
        setAbsoluteIncomeExpenseDiff(Math.abs(responseIncomeExpenseDiff));
        setSpentEarnedRatio(responseRatio);
        setSaving(savingAmount);
        setDailyAmount(responseDailyAmount);
        setRollover(responseRollover);

        setIncomeDifference(response.incomeChange);
        setExpenseDifference(response.expenseChange);
      })
      .catch((err) => {
        console.error("Failed to fetch income/expense", err);
        return null;
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getSetData();
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
              return absoluteIncomeExpenseDiff.toLocaleString("vi-VN", {
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
                  ${incomeExpenseDiff >= 0 ? "text-blue-500 dark:text-blue-400" : "text-error-600 dark:text-error-500"}`}
                >
                  {incomeExpenseDiff >= 0 ? "Tháng này còn" : "Tháng này đã quá"}
                </span>
              </div>

              <p className="mt-5 text-center text-sm text-gray-500 sm:text-base">
                {spentEarnedRatio <= 0 ? "Hiện chưa ghi nhận bất kỳ khoản thu nhập hay chi tiêu mới nào, hãy ghi chép lại nhé." :
                  spentEarnedRatio <= 60 && spentEarnedRatio > 0
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
            {!loading && income != 0 && (
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
            {!loading && expense != 0 && (
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

          {/* Rollover from previous month */}
          <div className="flex justify-between items-center border-t pt-3">
            <span className="flex text-sm font-medium text-gray-700 dark:text-white/90 gap-1">
              {rollover >= 0 ? "Tháng trước còn" : "Tháng trước đã quá"}
              {rollover != 0 && (
                <Tippy
                  content={rollover > 0 ? `Tháng trước bạn còn dư ${rollover.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })} nên khoản dư sẽ được tính sang tháng này. Bạn đã làm tốt lắm!` : 
                    `Tháng trước bạn đã tiêu quá ${Math.abs(rollover).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })} nên khoản quá hạn mức sẽ được tính sang tháng này.`}
                  key="rollover-explaination"
                >
                  <InfoIcon className="w-3 h-3 text-blue-500" />
                </Tippy>
              )}
            </span>
            <span className={`font-bold text-sm
              ${rollover > 0 ? "text-blue-600 dark:text-blue-500" :
                "text-error-600 dark:text-error-500"}`}
            >
              {Math.abs(rollover).toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Extra Fields */}
      {!loading && (income != 0 || expense != 0 || rollover != 0) && (
        <div className="mt-6 text-center">
          <h3 className="text-base font-semibold text-gray-700 dark:text-white mb-2">
            Khuyến nghị
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 text-center border-t pt-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="mt-4 md:mt-0">
              <span className="text-xs">
                {dailyAmount < 0 ? "Trung bình cần tiết kiệm" : "Mức an toàn có thể chi"}
              </span>
              <div className="font-medium text-gray-800 dark:text-white/90">
                {Math.abs(dailyAmount).toLocaleString("vi-VN", {
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
                <div className="flex justify-center text-xs">
                  <span className="flex items-center gap-1">
                    Mục tiêu tiết kiệm
                    <Tippy
                      key="saving-goal"
                      content={`Hãy cố gắng tiết kiệm được khoảng ${savingPercentage}% thu nhập của bạn đến cuối tháng nhé!`}
                    >
                      <InfoIcon className="w-3 h-3 text-blue-500" />
                    </Tippy>
                  </span>
                </div>
                <div className="font-medium text-gray-800 dark:text-white/90">
                  {(saving / daysRemain).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  })} / ngày
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
                  Còn {absoluteIncomeExpenseDiff.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}