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
    [ApiController, Route("api/homepage"), Authorize]
    public class HomepageController : ControllerBase
    {
        private readonly IAppUnitOfWork _unitOfWork;

        public HomepageController(IAppUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }


        [HttpGet("get-income-expense-by-period")]
        public async Task<IActionResult> GetIncomeExpenseByPeriod([FromQuery] DateTime dateFrom, [FromQuery] DateTime dateTo)
        {
            try
            {
                var transactions = await _unitOfWork.Transactions.GetList(selector => new Transaction
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
    }
}
