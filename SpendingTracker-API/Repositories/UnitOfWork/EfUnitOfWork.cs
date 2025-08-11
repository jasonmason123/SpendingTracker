using Microsoft.EntityFrameworkCore.Storage;
using SpendingTracker_API.Context;
using SpendingTracker_API.Repositories.CategoryRepository;
using SpendingTracker_API.Repositories.TransactionRepository;

namespace SpendingTracker_API.Repositories.UnitOfWork
{
    public class EfUnitOfWork : IAppUnitOfWork
    {
        private readonly AppDbContext _context;
        // Store an active transaction
        private IDbContextTransaction? _transaction;

        public ITransactionRepository Transactions { get; }
        public ICategoryRepository Categories { get; }

        public EfUnitOfWork(
            AppDbContext context,
            ITransactionRepository transactions,
            ICategoryRepository categories
        )
        {
            _context = context;
            Transactions = transactions;
            Categories = categories;
        }

        public async Task BeginTransactionAsync()
        {
            if (_transaction != null)
                return; // or throw to prevent nested transactions

            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction == null)
                throw new InvalidOperationException("No active transaction.");

            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction == null)
                return; // or throw to prevent rollback without transaction

            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }

        public async ValueTask DisposeAsync()
        {
            if (_transaction != null)
                await _transaction.DisposeAsync();

            await _context.DisposeAsync();
        }
    }
}
