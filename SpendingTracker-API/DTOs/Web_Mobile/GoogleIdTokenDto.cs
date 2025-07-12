namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class GoogleIdTokenDto
    {
        public string IdToken { get; set; }
        public bool RememberMe { get; set; } = false;
    }
}
