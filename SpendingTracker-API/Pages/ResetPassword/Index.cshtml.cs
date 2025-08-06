using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Localization;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using SpendingTracker_API.Controllers.AuthenticationControllers.DTOs;
using System.ComponentModel.DataAnnotations;
using ResetPasswordResources = SpendingTracker_API.Resources.Pages.ResetPassword.ResetPasswordResources;

namespace SpendingTracker_API.Pages.ResetPassword
{
    public class IndexModel : PageModel
    {
        [BindProperty(SupportsGet = true)]
        public string Token { get; set; }

        [BindProperty(SupportsGet = true)]
        public string UserId { get; set; }

        [BindProperty]
        [Display(Name = "NewPassword", ResourceType = typeof(ResetPasswordResources))]
        [Required(ErrorMessageResourceName = "ErrorNewPasswordRequired", ErrorMessageResourceType = typeof(ResetPasswordResources))]
        public string NewPassword { get; set; }

        [BindProperty]
        [Display(Name = "ConfirmPassword", ResourceType = typeof(ResetPasswordResources))]
        [Required(ErrorMessageResourceName = "ErrorConfirmPasswordRequired", ErrorMessageResourceType = typeof(ResetPasswordResources))]
        [Compare(nameof(NewPassword), ErrorMessageResourceName = "ErrorPasswordNotMatch", ErrorMessageResourceType = typeof(ResetPasswordResources))]
        public string ConfirmPassword { get; set; }

        public string? RedirectUrl { get; set; } = "/app";

        public string? ErrorMessage { get; set; }

        public bool PasswordResetSuccess { get; set; } = false;

        private readonly IPasswordAuth _passwordAuth;
        private readonly IStringLocalizer<ResetPasswordResources> _localizer;

        public IndexModel(IPasswordAuth passwordAuth, IStringLocalizer<ResetPasswordResources> localizer)
        {
            _passwordAuth = passwordAuth;
            _localizer = localizer;
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
                ErrorMessage = _localizer["ErrorResetPasswordFailed"];

            return Page();
        }
    }
}
