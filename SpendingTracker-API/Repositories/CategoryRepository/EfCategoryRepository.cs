using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Context;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Enums;
using SpendingTracker_API.Utils.UserRetriever;
using System.Linq.Expressions;
using X.PagedList;
using X.PagedList.Extensions;

namespace SpendingTracker_API.Repositories.CategoryRepository
{
    public class EfCategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;
        private readonly IUserClaimsRetriever _userRetriever;

        public EfCategoryRepository(AppDbContext context, IUserClaimsRetriever userRetriever)
        {
            _context = context;
            _userRetriever = userRetriever;
        }

        public async Task<Category> GetAsync(int id)
        {
            return await _context.Categories
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == _userRetriever.UserId && t.FlagDel == FlagBoolean.FALSE);
        }

        public async Task<List<Category>> GetListAsync(string? searchString = "", Expression<Func<Category, Category>>? selector = null)
        {
            var query = _context.Categories
                .Where(x => x.UserId == _userRetriever.UserId && x.FlagDel == FlagBoolean.FALSE);

            if(!string.IsNullOrEmpty(searchString))
            {
                query = query.Where(x => x.Name.Contains(searchString));
            }

            if (selector != null)
                query = query.Select(selector);

            return await query.ToListAsync();
        }

        public IPagedList<Category> GetPagedList(int pageNumber, int pageSize, string? searchString = "", Expression<Func<Category, Category>>? selector = null)
        {
            var query = _context.Categories
                .Where(x => x.UserId == _userRetriever.UserId && x.FlagDel == FlagBoolean.FALSE);

            if (!string.IsNullOrEmpty(searchString))
            {
                query = query.Where(x => x.Name.Contains(searchString));
            }

            if (selector != null)
                query = query.Select(selector);

            return query.ToPagedList(pageNumber, pageSize);
        }

        public async Task<Category> AddAsync(Category category)
        {
            category.CreatedAt = DateTime.UtcNow;
            category.UserId = _userRetriever.UserId;
            await _context.Categories.AddAsync(category);
            return category;
        }

        public Category Update(Category category)
        {
            _context.Categories.Attach(category);

            category.UpdatedAt = DateTime.UtcNow;

            _context.Entry(category).Property(b => b.Name).IsModified = true;
            //_context.Entry(category).Property(x => x.MonthlyLimit).IsModified = true;
            _context.Entry(category).Property(x => x.UpdatedAt).IsModified = true;

            return category;
        }

        public async Task<bool> ExecuteSoftDeleteAsync(int id)
        {
            var result = await _context.Categories
                .Where(x => x.Id == id && x.UserId == _userRetriever.UserId && x.FlagDel == FlagBoolean.FALSE)
                .ExecuteUpdateAsync(set => set
                    .SetProperty(x => x.FlagDel, FlagBoolean.TRUE));

            return result > 0;
        }

        public async Task<bool> ExecuteRestoreAsync(int id)
        {
            var result = await _context.Categories
                .Where(x => x.Id == id && x.UserId == _userRetriever.UserId && x.FlagDel == FlagBoolean.TRUE)
                .ExecuteUpdateAsync(set => set
                    .SetProperty(x => x.FlagDel, FlagBoolean.FALSE));

            return result > 0;
        }

        public async Task<bool> ExecuteHardDeleteAsync(int id)
        {
            var result = await _context.Categories
                .Where(x => x.Id == id && x.UserId == _userRetriever.UserId)
                .ExecuteDeleteAsync();

            return result > 0;
        }
    }
}
