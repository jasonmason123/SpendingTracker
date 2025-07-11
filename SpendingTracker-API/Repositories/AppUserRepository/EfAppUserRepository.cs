using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SpendingTracker_API.Context;
using SpendingTracker_API.Entities;
using System.Security.Claims;

namespace SpendingTracker_API.Repositories.AppUserRepository
{
    public class EfAppUserRepository : IAppUserRepository
    {
        private readonly UserManager<AppUser> _userManager;

        public EfAppUserRepository(UserManager<AppUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<AppUser> GetAsync(ClaimsPrincipal principal)
        {
            return await _userManager.GetUserAsync(id);
        }

        public async Task<AppUser> CreateAsync(AppUser user)
        {
            user.DateCreated = DateTime.UtcNow;
            await _context.AppUsers.AddAsync(user);
            return user;
        }

        public Task<AppUser> UpdateAsync(AppUser user)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await RelationalQueryableExtensions
                .ExecuteDeleteAsync(_context.AppUsers.Where(x => x.Id == id));

            if (result <= 0)
            {
                return false;
            }
            return true;
        }
    }
}
