using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.Controllers.StatisticsController.DTOs;
using SpendingTracker_API.Controllers.TransactionController.DTOs;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories.FilterParams;
using SpendingTracker_API.Repositories.UnitOfWork;
using SpendingTracker_API.Utils.Enums;
using SpendingTracker_API.Utils.Messages;

namespace SpendingTracker_API.Controllers.StatisticsController
{
    [ApiController, Route("api/statistics"), Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly IAppUnitOfWork _unitOfWork;

        private class DatesFromPeriodResult
        {
            public DateTime DateFrom { get; set; }
            public DateTime DateTo { get; set; }
            public DateTime? Chunk { get; set; }
        }

        public StatisticsController(IAppUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("get-income-expense-summary")]
        public async Task<ActionResult<IncomeExpenseSummaryResult>> GetIncomeExpenseSummary(
            [FromQuery] DateTime referenceDate,
            [FromQuery] PeriodUnit period,
            [FromQuery] bool rolloverRequired = false
        )
        {
            try
            {
                var dates = GetDatesFromPeriod(referenceDate, period, rolloverRequired);

                if (dates == null)
                {
                    return BadRequest("Invalid period, only accept these values: DAY, WEEK, MONTH, YEAR");
                }

                DateTime dateFrom = dates.DateFrom;
                DateTime dateTo = dates.DateTo;
                // Split between selected period and previous period
                DateTime? chunk = dates.Chunk;

                var transactions = await _unitOfWork.Transactions.GetListAsync(selector => new Transaction
                {
                    Amount = selector.Amount,
                    TransactionType = selector.TransactionType,
                }, new TransactionFilterParams
                {
                    DateFrom = dateFrom,
                    DateTo = dateTo
                });

                if (!rolloverRequired)
                {
                    var incomes = transactions
                        .Where(t => t.TransactionType == TransactionType.INCOME)
                        .Sum(t => t.Amount);

                    var expenses = transactions
                        .Where(t => t.TransactionType == TransactionType.EXPENSE)
                        .Sum(t => t.Amount);

                    return Ok(new IncomeExpenseSummaryResult
                    {
                        From = dateFrom,
                        To = dateTo,
                        Income = incomes,
                        Expense = expenses,
                    });
                }

                decimal selectedIncomes = 0;
                decimal selectedExpenses = 0;
                decimal previousIncomes = 0;
                decimal previousExpenses = 0;

                foreach (var t in transactions)
                {
                    if (t.Date >= chunk && t.Date <= dateTo)
                    {
                        if (t.TransactionType == TransactionType.INCOME)
                            selectedIncomes += t.Amount;
                        else if (t.TransactionType == TransactionType.EXPENSE)
                            selectedExpenses += t.Amount;
                    }
                    else if (t.Date >= dateFrom && t.Date < chunk)
                    {
                        if (t.TransactionType == TransactionType.INCOME)
                            previousIncomes += t.Amount;
                        else if (t.TransactionType == TransactionType.EXPENSE)
                            previousExpenses += t.Amount;
                    }
                }

                var rollover = previousIncomes - previousExpenses;
                var incomeChange = selectedIncomes - previousIncomes;
                var expenseChange = selectedExpenses - previousExpenses;
                var incomeExpenseDiff = selectedIncomes - selectedExpenses;
                var ratio = selectedExpenses == 0 ? 0m : selectedIncomes / selectedExpenses;

                return Ok(new IncomeExpenseSummaryResult
                {
                    From = chunk,
                    To = dateTo,
                    Income = selectedIncomes,
                    Expense = selectedExpenses,
                    IncomeChange = incomeChange,
                    ExpenseChange = expenseChange,
                    Rollover = rollover
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetIncomeExpenseSummary error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("get-income-expense-custom-range")]
        public async Task<ActionResult<IncomeExpenseResult>> GetIncomeExpenseCustomRange([FromQuery] DateTime dateFrom, [FromQuery] DateTime dateTo)
        {
            try
            {
                var transactions = await _unitOfWork.Transactions.GetListAsync(selector => new Transaction
                {
                    Amount = selector.Amount,
                    TransactionType = selector.TransactionType,
                }, new TransactionFilterParams
                {
                    DateFrom = dateFrom,
                    DateTo = dateTo
                });

                decimal incomes = 0;
                decimal expenses = 0;

                transactions.ForEach(x =>
                {
                    if (x.TransactionType == TransactionType.INCOME)
                        incomes += x.Amount;
                    else if (x.TransactionType == TransactionType.EXPENSE)
                        expenses += x.Amount;
                });

                return Ok(new IncomeExpenseResult
                {
                    From = dateFrom,
                    To = dateTo,
                    Income = incomes,
                    Expense = expenses,
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetIncomeExpenseCustomRange error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("get-top-3-recent")]
        public ActionResult<IEnumerable<TransactionDto>> GetTopThreeRecentTransactions()
        {
            try
            {
                var list = _unitOfWork.Transactions.GetPagedList(1, 3);
                var transactionList = list.Select(transaction => new TransactionDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Merchant = transaction.Merchant,
                    Date = transaction.Date,
                    Amount = transaction.Amount,
                    TransactionType = transaction.TransactionType,
                    CreatedAt = transaction.CreatedAt,
                    UpdatedAt = transaction.UpdatedAt
                }).ToList();
                return Ok(transactionList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetTopThreeRecentTransactions error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("amounts/monthly-by-year")]
        public async Task<IActionResult> GetMonthlyAmountsByYear([FromQuery] int year)
        {
            try
            {
                var yearlyTransactions = await _unitOfWork.Transactions.GetListAsync(selector: selector => new Transaction
                {
                    Amount = selector.Amount,
                }, new TransactionFilterParams
                {
                    DateFrom = DateTime.SpecifyKind(new DateTime(year, 1, 1), DateTimeKind.Utc),
                    DateTo = DateTime.SpecifyKind(new DateTime(year, 12, 31, 23, 59, 59), DateTimeKind.Utc)
                });

                var months = Enumerable.Range(1, 12).ToList();

                var incomes = yearlyTransactions
                    .Where(x => x.TransactionType == TransactionType.INCOME)
                    .GroupBy(t => t.Date.Month)
                    .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

                // Ensure all months are represented in the dictionary, even if they have no transactions
                incomes = months.ToDictionary(
                    month => month,
                    month => incomes.ContainsKey(month) ? incomes[month] : 0
                );

                var expenses = yearlyTransactions
                    .Where(x => x.TransactionType == TransactionType.EXPENSE)
                    .GroupBy(t => t.Date.Month)
                    .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

                // Ensure all months are represented in the dictionary, even if they have no transactions
                expenses = months.ToDictionary(
                    month => month,
                    month => expenses.ContainsKey(month) ? expenses[month] : 0
                );

                return Ok(new MonthlyAmountsByYearDto
                {
                    Year = year,
                    MonthlyIncomes = incomes,
                    MonthlyExpenses = expenses
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetMonthlyAmountsByYear error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        // Get period dateFrom and dateTo
        private DatesFromPeriodResult GetDatesFromPeriod(
            DateTime referenceUtcDate,
            PeriodUnit period,
            bool rolloverRequired = false
        )
        {
            DateTime dateFrom;
            DateTime dateTo;
            // Split between selected period and previous period
            DateTime? chunk = null;

            // If rollover is required, set dateFrom from the start of the previous period
            switch (period)
            {
                case PeriodUnit.DAY:
                    dateFrom = referenceUtcDate.Date;
                    dateTo = referenceUtcDate.AddDays(1).AddTicks(-1); // End of day

                    if (rolloverRequired)
                    {
                        chunk = dateFrom;
                        // Set dateFrom to previous date
                        dateFrom = referenceUtcDate.AddDays(-1).Date;
                    }
                    break;

                case PeriodUnit.WEEK:
                    // Assume week starts on Monday
                    int diff = (7 + (referenceUtcDate.DayOfWeek - DayOfWeek.Monday)) % 7;
                    dateFrom = referenceUtcDate.Date.AddDays(-1 * diff);
                    dateTo = dateFrom.AddDays(7);

                    if (rolloverRequired)
                    {
                        chunk = dateFrom;
                        // Set dateFrom to previous week
                        dateFrom = dateFrom.AddDays(-7);
                    }

                    break;

                case PeriodUnit.MONTH:
                    dateFrom = new DateTime(referenceUtcDate.Year, referenceUtcDate.Month, 1);
                    dateTo = dateFrom.AddMonths(1).AddTicks(-1);

                    if (rolloverRequired)
                    {
                        chunk = dateFrom;
                        // Set dateFrom to previous month
                        dateFrom = dateFrom.AddMonths(-1);
                    }

                    break;

                case PeriodUnit.YEAR:
                    dateFrom = new DateTime(referenceUtcDate.Year, 1, 1);
                    dateTo = dateFrom.AddYears(1).AddTicks(-1);

                    if (rolloverRequired)
                    {
                        chunk = dateFrom;
                        // Set dateFrom to previous year
                        dateFrom = dateFrom.AddYears(-1);
                    }

                    break;

                default:
                    return null;
            }

            return new DatesFromPeriodResult
            {
                DateFrom = DateTime.SpecifyKind(dateFrom, DateTimeKind.Utc),
                DateTo = DateTime.SpecifyKind(dateTo, DateTimeKind.Utc),
                Chunk = chunk.HasValue ? DateTime.SpecifyKind(chunk.Value, DateTimeKind.Utc) : null
            };
        }
    }
}
