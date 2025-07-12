using SpendingTracker_API.Entities;

namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class AuthenticationResult
    {
        public bool Succeed { get; set; }
        public bool IsLockedOut { get; set; }
        public AppUser? User { get; set; }
    }
}
