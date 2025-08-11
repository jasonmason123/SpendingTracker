using SpendingTracker_API.Entities;
using SpendingTracker_API.Repositories._FilterParams;
using System.Linq.Expressions;
using X.PagedList;

namespace SpendingTracker_API.Repositories.TransactionRepository
{
    public interface ITransactionRepository
    {
        public Task<Transaction> GetAsync(int id);
        public Task<List<Transaction>> GetListAsync(Expression<Func<Transaction, Transaction>>? selector = null, TransactionFilterParams? filterParams = null);
        public IPagedList<Transaction> GetPagedList(int pageNumber, int pageSize, Expression<Func<Transaction, Transaction>>? selector = null, TransactionFilterParams? filterParams = null);
        public IPagedList<Transaction> Search(string searchString, int pageNumber, int pageSize, Expression<Func<Transaction, Transaction>>? selector = null);
        public Task<Transaction> AddAsync(Transaction transaction);
        public Task<Transaction> UpdateAsync(Transaction transaction);
        public Task<bool> ExecuteDeleteAsync(int id);
    }
}
