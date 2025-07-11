using SpendingTracker_API.Entities;
using System.Security.Claims;

namespace SpendingTracker_API.Repositories.AppUserRepository
{
    public interface IAppUserRepository
    {
        public Task<AppUser> GetAsync(ClaimsPrincipal principal);
        public Task<AppUser> CreateAsync(AppUser user);
        public Task<AppUser> UpdateAsync(AppUser user);
        public Task<bool> DeleteAsync(string id);
    }
}
