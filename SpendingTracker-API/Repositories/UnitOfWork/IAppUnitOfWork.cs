using SpendingTracker_API.Repositories.TransactionRepository;

namespace SpendingTracker_API.Repositories.UnitOfWork
{
    public interface IAppUnitOfWork : IDisposable, IAsyncDisposable
    {
        ITransactionRepository Transactions { get; }
        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
