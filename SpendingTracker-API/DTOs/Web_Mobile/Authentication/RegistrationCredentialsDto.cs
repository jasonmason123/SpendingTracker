namespace SpendingTracker_API.DTOs.Web_Mobile.Authentication
{
    public class RegistrationCredentialsDto : PasswordCredentialsDto
    {
        public string? Username { get; set; }
        public string? RedirectUrl { get; set; }
    }
}
