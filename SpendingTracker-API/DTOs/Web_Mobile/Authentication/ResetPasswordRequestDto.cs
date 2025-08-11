namespace SpendingTracker_API.DTOs.Web_Mobile.Authentication
{
    public class ResetPasswordRequestDto
    {
        public string UserId { get; set; }
        public string TokenBase64Encoded { get; set; }
        public string NewPassword { get; set; }
    }
}
