using SpendingTracker_API.Entities;
using X.PagedList;

namespace SpendingTracker_API.Repositories.TransactionRepository
{
    public interface ITransactionRepository
    {
        public Task<Transaction> GetAsync(int id);
        public IPagedList<Transaction> GetList(int pageNumber, int pageSize);
        public IPagedList<Transaction> Search(string searchString, int pageNumber, int pageSize);
        public Task<Transaction> AddAsync(Transaction transaction);
        public Task<Transaction> UpdateAsync(Transaction transaction);
        public Task<bool> RemoveAsync(int id);
    }
}
