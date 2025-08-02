using SpendingTracker_API.Entities;

namespace SpendingTracker_API.Controllers.AuthenticationControllers.DTOs
{
    public class AuthenticationResult
    {
        public bool Succeed { get; set; }
        public bool IsLockedOut { get; set; }
        public AppUser? User { get; set; }
    }
}
