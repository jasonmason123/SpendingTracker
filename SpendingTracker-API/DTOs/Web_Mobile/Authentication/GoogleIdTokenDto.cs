namespace SpendingTracker_API.DTOs.Web_Mobile.Authentication
{
    public class GoogleIdTokenDto
    {
        public string IdToken { get; set; }
        public bool RememberMe { get; set; } = false;
    }
}
