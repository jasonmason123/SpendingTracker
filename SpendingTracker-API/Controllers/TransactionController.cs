using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Messages;
using SpendingTracker_API.Repositories.UnitOfWork;
using System.Linq.Expressions;
using X.PagedList;
using X.PagedList.Extensions;
using SpendingTracker_API.Repositories.FilterParams;

namespace SpendingTracker_API.Controllers
{
    [ApiController, Route("api/transactions"), Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly IAppUnitOfWork _unitOfWork;

        public TransactionController(IAppUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransactionDto>> GetAsync(int id)
        {
            try
            {
                var transaction = await _unitOfWork.Transactions.GetAsync(id);
                return Ok(new TransactionDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Merchant = transaction.Merchant,
                    Date = transaction.Date,
                    Amount = transaction.Amount,
                    TransactionType = transaction.TransactionType,
                    CreatedAt = transaction.CreatedAt,
                    UpdatedAt = transaction.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /get/{id} - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("get-list")]
        public ActionResult<PagedListResult<TransactionDto>> GetList(
            [FromQuery] string? searchString,
            [FromQuery] TransactionFilterParams? filterParams,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10
        )
        {
            try
            {
                IPagedList<Transaction> transactionList;
                Expression<Func<Transaction, Transaction>> transactionSelector = selector => new Transaction
                {
                    Id = selector.Id,
                    Description = selector.Description,
                    Merchant = selector.Merchant,
                    Date = selector.Date,
                    Amount = selector.Amount,
                    TransactionType = selector.TransactionType
                };
                if (!string.IsNullOrEmpty(searchString))
                {
                    transactionList = _unitOfWork.Transactions
                        .Search(searchString, pageNumber, pageSize, transactionSelector);
                }
                else
                {
                    transactionList = _unitOfWork.Transactions
                        .GetPagedList(pageNumber, pageSize, transactionSelector, filterParams);
                }

                // Convert to DTOs
                var transactionDtoList = transactionList.Select(transaction => new TransactionDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Merchant = transaction.Merchant,
                    Date = transaction.Date,
                    Amount = transaction.Amount,
                    TransactionType = transaction.TransactionType
                });

                // Create the paged result list
                var pagedListResult = new PagedListResult<TransactionDto>
                {
                    PageCount = transactionList.PageCount,
                    PageNumber = transactionList.PageNumber,
                    PageSize = transactionList.PageSize,
                    TotalItemCount = transactionList.TotalItemCount,
                    Items = transactionDtoList.ToList(),
                };

                return Ok(pagedListResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /get-list - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("add")]
        public async Task<ActionResult<TransactionDto>> AddAsync([FromBody] TransactionDto transactionDto)
        {
            try
            {
                var transaction = new Transaction
                {
                    Description = transactionDto.Description,
                    Merchant = transactionDto.Merchant,
                    Date = transactionDto.Date,
                    Amount = transactionDto.Amount,
                    TransactionType = transactionDto.TransactionType
                };

                await _unitOfWork.Transactions.AddAsync(transaction);
                await _unitOfWork.SaveChangesAsync();

                return Ok(new TransactionDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Merchant = transaction.Merchant,
                    Date = transaction.Date,
                    Amount = transaction.Amount,
                    TransactionType = transaction.TransactionType,
                    CreatedAt = transaction.CreatedAt,
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /add - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult<TransactionDto>> UpdateAsync(int id, [FromBody] TransactionDto transactionDto)
        {
            try
            {
                var transaction = new Transaction
                {
                    Id = id,
                    Description = transactionDto.Description,
                    Merchant = transactionDto.Merchant,
                    Date = transactionDto.Date,
                    Amount = transactionDto.Amount,
                    TransactionType = transactionDto.TransactionType,
                };

                await _unitOfWork.Transactions.UpdateAsync(transaction);
                await _unitOfWork.SaveChangesAsync();

                return Ok(new TransactionDto
                {
                    Id = transaction.Id,
                    Description = transaction.Description,
                    Merchant = transaction.Merchant,
                    Date = transaction.Date,
                    Amount = transaction.Amount,
                    TransactionType = transaction.TransactionType,
                    CreatedAt = transaction.CreatedAt,
                    UpdatedAt = transaction.UpdatedAt
                });
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException: /update/{id} - {ex}");
                return NotFound("Transaction not found or does not belong to the user.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /update/{id} - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> RemoveAsync(int id)
        {
            try
            {
                var result = await _unitOfWork.Transactions.RemoveAsync(id);

                if (result)
                    return NoContent();

                return BadRequest();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: /delete/{id} - {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }
    }
}
