using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Messages;
using SpendingTracker_API.Repositories.UnitOfWork;
using System.Linq.Expressions;

namespace SpendingTracker_API.Controllers
{
    [ApiController, Route("api/transaction"), Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly IAppUnitOfWork _unitOfWork;

        public TransactionController(IAppUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("get/{id}")]
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
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpGet("get-list")]
        public ActionResult<IEnumerable<TransactionDto>> GetList([FromQuery] string? searchString, [FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                IEnumerable<Transaction> transactionList;
                Expression<Func<Transaction, Transaction>> transactionSelector = selector => new Transaction
                {
                    Id = selector.Id,
                    Description = selector.Description,
                    Merchant = selector.Merchant,
                    Date = selector.Date,
                    Amount = selector.Amount,
                    TransactionType = selector.TransactionType,
                    CreatedAt = selector.CreatedAt,
                    UpdatedAt = selector.UpdatedAt
                };
                if (!string.IsNullOrEmpty(searchString))
                {
                    transactionList = _unitOfWork.Transactions
                        .Search(searchString, pageNumber, pageSize, transactionSelector);
                }
                else
                {
                    transactionList = _unitOfWork.Transactions
                        .GetPagedList(pageNumber, pageSize, transactionSelector);
                }

                // Convert to DTOs
                var transactionListDto = transactionList.Select(transaction => new TransactionDto
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

                return Ok(transactionListDto);
            }
            catch (Exception ex)
            {
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
                return NotFound("Transaction not found or does not belong to the user.");
            }
            catch (Exception ex)
            {
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
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }
    }
}
