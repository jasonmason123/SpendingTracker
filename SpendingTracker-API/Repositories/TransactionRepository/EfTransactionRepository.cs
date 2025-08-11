using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Context;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories._FilterParams;
using SpendingTracker_API.Utils.UserRetriever;
using System.Linq.Expressions;
using X.PagedList;
using X.PagedList.Extensions;

namespace SpendingTracker_API.Repositories.TransactionRepository
{
    public class EfTransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _context;
        private readonly IUserClaimsRetriever _userRetriever;

        public EfTransactionRepository(AppDbContext context, IUserClaimsRetriever userRetriever)
        {
            _context = context;
            _userRetriever = userRetriever;
        }

        public async Task<Transaction> GetAsync(int id)
        {
            return await _context.Transactions
                .Where(t => t.Id == id && t.UserId == _userRetriever.UserId)
                .Include(x => x.TransactionCategory)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Transaction>> GetListAsync(
            Expression<Func<Transaction, Transaction>>? selector = null,
            TransactionFilterParams? filterParams = null
        )
        {
            var query = _context.Transactions
                .Where(t => t.UserId == _userRetriever.UserId);

            if (filterParams != null)
            {
                if (filterParams.DateFrom.HasValue)
                {
                    query = query.Where(t => t.Date >= filterParams.DateFrom.Value);
                }
                if (filterParams.DateTo.HasValue)
                {
                    query = query.Where(t => t.Date <= filterParams.DateTo.Value);
                }

                if (filterParams.TransactionType.HasValue)
                {
                    query = query.Where(t => t.TransactionType == filterParams.TransactionType.Value);
                }
            }

            if (selector != null)
                query = query.Include(x => x.TransactionCategory).Select(selector);

            return await query.ToListAsync();
        }

        public IPagedList<Transaction> GetPagedList(
            int pageNumber,
            int pageSize,
            Expression<Func<Transaction, Transaction>>? selector = null,
            TransactionFilterParams? filterParams = null
        )
        {
            var query = _context.Transactions
                .Where(t => t.UserId == _userRetriever.UserId)
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.Id)
                .AsQueryable();

            if(filterParams != null)
            {
                if (filterParams.DateFrom.HasValue)
                {
                    query = query.Where(t => t.Date >= filterParams.DateFrom.Value);
                }

                if (filterParams.DateTo.HasValue)
                {
                    query = query.Where(t => t.Date <= filterParams.DateTo.Value);
                }

                if (filterParams.TransactionType.HasValue)
                {
                    query = query.Where(t => t.TransactionType == filterParams.TransactionType.Value);
                }
            }

            if(selector != null)
                query = query.Select(selector);

            return query.ToPagedList(pageNumber, pageSize);
        }

        public IPagedList<Transaction> Search(string searchString, int pageNumber, int pageSize, Expression<Func<Transaction, Transaction>>? selector = null)
        {
            // PostgreSQL ILIKE for case-insensitive search
            var query = _context.Transactions
                .Where(t => t.UserId == _userRetriever.UserId &&
                            (EF.Functions.ILike(t.Description, $"%{searchString}%") ||
                             EF.Functions.ILike(t.Merchant, $"%{searchString}%")))
                .OrderByDescending(t => t.Date)
                .AsQueryable();

            if (selector != null)
                query = query.Select(selector);

            return query.ToPagedList(pageNumber, pageSize);
        }

        public async Task<Transaction> AddAsync(Transaction transaction)
        {
            transaction.CreatedAt = DateTime.UtcNow;
            transaction.UserId = _userRetriever.UserId;
            await _context.Transactions.AddAsync(transaction);
            return transaction;
        }

        public async Task<Transaction> UpdateAsync(Transaction transaction)
        {
            var existingTransaction = await GetAsync(transaction.Id);

            if (existingTransaction == null || existingTransaction.UserId != _userRetriever.UserId)
            {
                throw new InvalidOperationException("Transaction not found or does not belong to the user.");
            }

            if (existingTransaction.Description != transaction.Description)
            {
                existingTransaction.Description = transaction.Description;
            }

            if (existingTransaction.Merchant != transaction.Merchant)
            {
                existingTransaction.Merchant = transaction.Merchant;
            }

            if (existingTransaction.Date != transaction.Date)
            {
                existingTransaction.Date = transaction.Date;
            }

            if (existingTransaction.Amount != transaction.Amount)
            {
                existingTransaction.Amount = transaction.Amount;
            }

            if (existingTransaction.CategoryId != transaction.CategoryId)
            {
                existingTransaction.CategoryId = transaction.CategoryId;
            }

            existingTransaction.UpdatedAt = DateTime.UtcNow;

            return existingTransaction;
        }

        public async Task<bool> ExecuteDeleteAsync(int id)
        {
            var result = await _context.Transactions
                .Where(x => x.Id == id && x.UserId == _userRetriever.UserId)
                .ExecuteDeleteAsync();

            if (result <= 0)
            {
                return false;
            }
            return true;
        }
    }
}
