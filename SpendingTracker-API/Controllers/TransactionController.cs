using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Messages;
using SpendingTracker_API.Repositories.UnitOfWork;

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
        public async Task<IActionResult> GetAsync(int id)
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
        public IActionResult GetList([FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                var list = _unitOfWork.Transactions.GetList(pageNumber, pageSize);
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

        [HttpGet("search")]
        public IActionResult Search([FromQuery] string searchString, [FromQuery] int pageNumber, [FromQuery] int pageSize)
        {
            try
            {
                var list = _unitOfWork.Transactions.Search(searchString, pageNumber, pageSize);
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

        [HttpPost("add")]
        public async Task<IActionResult> AddAsync([FromBody] TransactionDto transactionDto)
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
        public async Task<IActionResult> UpdateAsync(int id, [FromBody] TransactionDto transactionDto)
        {
            try
            {
                var transaction = new Transaction
                {
                    Id = id,
                    Description = transactionDto.Description,
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
