using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using SpendingTracker_API.Controllers.AuthenticationControllers.DTOs;
using System.ComponentModel.DataAnnotations;

namespace SpendingTracker_API.Pages.ResetPassword
{
    public class IndexModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public string Token { get; set; }

        [BindProperty(SupportsGet = true)]
        public string UserId { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "New password is required.")]
        public string NewPassword { get; set; }

        [BindProperty]
        [Required(ErrorMessage = "Please confirm your new password.")]
        [Compare(nameof(NewPassword), ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; }

        public string? RedirectUrl { get; set; } = "/app";

        public string? ErrorMessage { get; set; }

        public bool PasswordResetSuccess { get; set; } = false;

        private readonly IPasswordAuth _passwordAuth;

        public IndexModel(IPasswordAuth passwordAuth)
        {
            _passwordAuth = passwordAuth;
        }

        public void OnGet(string token, string userId)
        {
            Token = token;
            UserId = userId;
            RedirectUrl = Request.Query["redirect"];
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
                return Page();

            var resetPasswordRequest = new ResetPasswordRequestDto
            {
                NewPassword = NewPassword,
                TokenBase64Encoded = Token,
                UserId = UserId,
            };
            var result = await _passwordAuth.ResetPasswordAsync(resetPasswordRequest);

            if (result)
                PasswordResetSuccess = true;
            else
                ErrorMessage = "Password reset failed.";

            return Page();
        }
    }
}
