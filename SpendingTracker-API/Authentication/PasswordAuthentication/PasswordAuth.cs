using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Memory;
using SpendingTracker_API.Authentication.OtpAuthentication;
using SpendingTracker_API.DTOs.Web_Mobile.Authentication;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Utils.Messages;
using SpendingTracker_API.Utils.NotificationService;
using System.Text;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public class PasswordAuth : IPasswordAuth
    {
        private const string ALLOWED_CHARACTERS_FOR_USERNAME = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

        private readonly UserManager<AppUser> _userManager;
        private readonly INotificationSender _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _memoryCache;
        private readonly IOtpAuth _otpAuth;

        public PasswordAuth(
            UserManager<AppUser> userManager,
            INotificationSender notificationService,
            IHttpContextAccessor httpContextAccessor,
            IMemoryCache memoryCache,
            IOtpAuth otpAuth
        )
        {
            _userManager = userManager;
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;
            _memoryCache = memoryCache;
            _otpAuth = otpAuth;
        }

        public async Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials)
        {
            var user = await _userManager.FindByEmailAsync(passwordCredentials.Email);

            if (user == null)
            {
                return new AuthenticationResult
                {
                    User = null,
                    IsLockedOut = false,
                    Succeeded = false,
                    IsEmailConfirmed = false,
                };
            }

            var result = new AuthenticationResult
            {
                User = user,
                IsEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user),
                IsLockedOut = await _userManager.IsLockedOutAsync(user),
                Succeeded = await _userManager.CheckPasswordAsync(user, passwordCredentials.Password),
            };

            //Check lockout and email confirmation status
            if (!result.IsEmailConfirmed || result.IsLockedOut)
            {
                return result;
            }

            if (result.Succeeded)
            {
                // ✅ Reset failed count on success
                await _userManager.ResetAccessFailedCountAsync(user);
            }
            else
            {
                // ❌ Increment failed count
                await _userManager.AccessFailedAsync(user);

                if (await _userManager.IsLockedOutAsync(user))
                {
                    result.IsLockedOut = true;
                }
            }

            return result;
        }

        public async Task<RegistrationResult> RegisterAsync(RegistrationCredentialsDto registrationCredentials, bool requiresVerification = false)
        {
            if(registrationCredentials.Username == null)
            {
                registrationCredentials.Username = registrationCredentials.Email.Split("@")[0];
            }

            // Refine username before saving
            var refinedUsername = registrationCredentials.Username.Replace(" ", "_");
            refinedUsername = new string(refinedUsername.Where(c => ALLOWED_CHARACTERS_FOR_USERNAME.Contains(c)).ToArray());

            var user = new AppUser
            {
                UserName = refinedUsername,
                Email = registrationCredentials.Email,
                EmailConfirmed = !requiresVerification,
            };

            IdentityResult result;

            if (string.IsNullOrEmpty(registrationCredentials.Password))
            {
                result = await _userManager.CreateAsync(user);
            }
            else
            {
                result = await _userManager.CreateAsync(user, registrationCredentials.Password);
            }
            
            if (result.Succeeded)
            {
                var message = requiresVerification ?
                    "Registration successful. Please verify your email." :
                    "Registration successful without email verification.";

                return new RegistrationResult
                {
                    Succeeded = true,
                    RequiresVerification = requiresVerification,
                    User = user,
                    ConfirmationToken = null,
                    Message = message,
                };
            }

            var stringBuilder = new StringBuilder();
            foreach (var error in result.Errors)
            {
                stringBuilder.AppendLine(error.Description);
            }

            return new RegistrationResult
            {
                Succeeded = false,
                RequiresVerification = requiresVerification,
                User = null,
                ConfirmationToken = null,
                Message = stringBuilder.ToString()
            };
        }

        public async Task RequestResetPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email)
                ?? throw new InvalidOperationException(ErrorMessages.USER_EMAIL_NOT_FOUND);

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var subject = "Your link to reset password";
            var httpRequest = _httpContextAccessor.HttpContext.Request;
            var url = $"{httpRequest.Scheme}://{httpRequest.Host}/reset-password/{encodedToken}/{user.Id}";
            var body = $"<p>Visit here to reset your password: <a href=\"{url}\">{url}</a></p>";

            _notificationService.SendAsync(user.Email, new MessageStructureDto
            {
                Subject = subject,
                Body = body,
                IsHtmlBody = true
            });
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest)
        {
            var user = await _userManager.FindByIdAsync(resetPasswordRequest.UserId)
                ?? throw new ArgumentException("User not found");
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(resetPasswordRequest.TokenBase64Encoded));
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPasswordRequest.NewPassword);
            if (!result.Succeeded)
            {
                foreach(var error in result.Errors)
                {
                    Console.WriteLine("Reset password error: " + error.Description);
                }
            }
            return result.Succeeded;
        }
    }
}
