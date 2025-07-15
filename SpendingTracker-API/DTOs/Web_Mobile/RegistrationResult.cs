using SpendingTracker_API.Entities;

namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class RegistrationResult
    {
        public bool Succeed { get; set; }
        public AppUser? User { get; set; }
        public string? ConfirmationToken { get; set; } // Token for email confirmation or verification
        public string? Message { get; set; }
    }
}
