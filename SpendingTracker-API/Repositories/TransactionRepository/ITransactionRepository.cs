using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories.FilterParams;
using System.Linq.Expressions;
using X.PagedList;

namespace SpendingTracker_API.Repositories.TransactionRepository
{
    public interface ITransactionRepository
    {
        public Task<Transaction> GetAsync(int id);
        public Task<IEnumerable<Transaction>> GetList(Expression<Func<Transaction, Transaction>>? selector = null, TransactionFilterParams? filterParams = null);
        public IPagedList<Transaction> GetPagedList(int pageNumber, int pageSize, Expression<Func<Transaction, Transaction>>? selector = null, TransactionFilterParams? filterParams = null);
        public IPagedList<Transaction> Search(string searchString, int pageNumber, int pageSize, Expression<Func<Transaction, Transaction>>? selector = null);
        public Task<Transaction> AddAsync(Transaction transaction);
        public Task<Transaction> UpdateAsync(Transaction transaction);
        public Task<bool> RemoveAsync(int id);
    }
}
