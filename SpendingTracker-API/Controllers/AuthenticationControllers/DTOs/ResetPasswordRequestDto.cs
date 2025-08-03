namespace SpendingTracker_API.Controllers.AuthenticationControllers.DTOs
{
    public class ResetPasswordRequestDto
    {
        public string UserId { get; set; }
        public string TokenBase64Encoded { get; set; }
        public string NewPassword { get; set; }
    }
}
