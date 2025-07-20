using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories.FilterParams;
using SpendingTracker_API.Repositories.UnitOfWork;
using SpendingTracker_API.Utils.Enums;
using SpendingTracker_API.Utils.Messages;

namespace SpendingTracker_API.Controllers
{
    [ApiController, Route("api/statistics"), Authorize]
    public class StatisticsController : ControllerBase
    {
        private readonly IAppUnitOfWork _unitOfWork;

        public StatisticsController(IAppUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        [HttpGet("get-income-expense-by-period")]
        public async Task<IActionResult> GetIncomeExpenseByPeriod([FromQuery] DateTime dateFrom, [FromQuery] DateTime dateTo)
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

                var incomes = transactions
                    .Where(t => t.TransactionType == TransactionType.INCOME)
                    .Sum(t => t.Amount);

                var expenses = transactions
                    .Where(t => t.TransactionType == TransactionType.EXPENSE)
                    .Sum(t => t.Amount);

                return Ok(new
                {
                    Income = incomes,
                    Expense = expenses,
                });
            }
            catch (Exception ex)
            {
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
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }
    }
}
