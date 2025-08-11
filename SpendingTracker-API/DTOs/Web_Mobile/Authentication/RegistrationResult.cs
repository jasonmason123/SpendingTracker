using SpendingTracker_API.Entities;

namespace SpendingTracker_API.DTOs.Web_Mobile.Authentication
{
    public class RegistrationResult
    {
        public bool Succeeded { get; set; }
        public bool RequiresVerification { get; set; }
        public AppUser? User { get; set; }
        public string? ConfirmationToken { get; set; } // Token for email confirmation or verification
        public string? Message { get; set; }
    }
}
