using SpendingTracker_API.Entities;
using System.Linq.Expressions;
using X.PagedList;

namespace SpendingTracker_API.Repositories.CategoryRepository
{
    public interface ICategoryRepository
    {
        public Task<Category> GetAsync(int id);
        public Task<List<Category>> GetListAsync(string? searchString = "", Expression<Func<Category, Category>>? selector = null);
        public IPagedList<Category> GetPagedList(int pageNumber, int pageSize, string? searchString = "", Expression<Func<Category, Category>>? selector = null);
        public Task<Category> AddAsync(Category category);
        public Category Update(Category category);
        public Task<bool> ExecuteSoftDeleteAsync(int id);
        public Task<bool> ExecuteRestoreAsync(int id);
        public Task<bool> ExecuteHardDeleteAsync(int id);
    }
}
