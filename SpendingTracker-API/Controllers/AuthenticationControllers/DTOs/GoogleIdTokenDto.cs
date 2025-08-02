namespace SpendingTracker_API.Controllers.AuthenticationControllers.DTOs
{
    public class GoogleIdTokenDto
    {
        public string IdToken { get; set; }
        public bool RememberMe { get; set; } = false;
    }
}
