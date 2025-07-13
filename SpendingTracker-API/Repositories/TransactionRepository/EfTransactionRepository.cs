using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Context;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Enums;
using SpendingTracker_API.Utils.UserRetriever;
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
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == _userRetriever.UserId);
        }

        public IPagedList<Transaction> GetList(int pageNumber, int pageSize)
        {
            return _context.Transactions
                .Where(t => t.UserId == _userRetriever.UserId)
                .OrderByDescending(t => t.Date)
                .ToPagedList(pageNumber, pageSize);
        }

        public IPagedList<Transaction> Search(string searchString, int pageNumber, int pageSize)
        {
            return _context.Transactions
                .Where(t => t.UserId == _userRetriever.UserId && 
                            (t.Description.Contains(searchString) || 
                             t.Merchant.Contains(searchString)))
                .OrderByDescending(t => t.Date)
                .ToPagedList(pageNumber, pageSize);
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

            if (existingTransaction == null)
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
                if (existingTransaction.TransactionType == TransactionType.INCOME && transaction.Amount < 0)
                    existingTransaction.Amount = Math.Abs(transaction.Amount);
                else if (existingTransaction.TransactionType == TransactionType.EXPENSE && transaction.Amount > 0)
                    existingTransaction.Amount = -transaction.Amount;
            }

            existingTransaction.UpdatedAt = DateTime.UtcNow;

            return existingTransaction;
        }

        public async Task<bool> RemoveAsync(int id)
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
