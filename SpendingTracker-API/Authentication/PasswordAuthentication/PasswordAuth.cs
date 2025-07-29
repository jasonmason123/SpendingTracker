using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json.Linq;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Services.NotificationService;
using SpendingTracker_API.Utils.Messages;
using System.Text;

namespace SpendingTracker_API.Authentication.PasswordAuthentication
{
    public class PasswordAuth : IPasswordAuth
    {
        private const string ALLOWED_CHARACTERS_FOR_USERNAME = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";

        private readonly UserManager<AppUser> _userManager;
        private readonly INotificationService _notificationService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMemoryCache _memoryCache;

        public PasswordAuth(
            UserManager<AppUser> userManager,
            INotificationService notificationService,
            IHttpContextAccessor httpContextAccessor,
            IMemoryCache memoryCache
        )
        {
            _userManager = userManager;
            _notificationService = notificationService;
            _httpContextAccessor = httpContextAccessor;
            _memoryCache = memoryCache;
        }

        public async Task<AuthenticationResult> AuthenticateAsync(PasswordCredentialsDto passwordCredentials)
        {
            var user = await _userManager.FindByEmailAsync(passwordCredentials.Email)
                ?? throw new ArgumentException(ErrorMessages.USER_EMAIL_NOT_FOUND);

            //Check lockout status
            if (await _userManager.IsLockedOutAsync(user))
            {
                throw new UnauthorizedAccessException(
                    $"{ErrorMessages.USER_LOCKED_OUT_UNTIL} {await _userManager.GetLockoutEndDateAsync(user)}.");
            }

            //Check if the user is confirmed (if email confirmation is required)
            if (!await _userManager.IsEmailConfirmedAsync(user))
            {
                throw new UnauthorizedAccessException(ErrorMessages.USER_EMAIL_NOT_CONFIRMED);
            }

            var isPasswordCorrect = await _userManager.CheckPasswordAsync(user, passwordCredentials.Password);

            if (isPasswordCorrect)
            {
                // ✅ Reset failed count on success
                await _userManager.ResetAccessFailedCountAsync(user);

                return new AuthenticationResult
                {
                    Succeed = true,
                    IsLockedOut = false,
                    User = user,
                };
            }
            else
            {
                // ❌ Increment failed count
                await _userManager.AccessFailedAsync(user);

                if (await _userManager.IsLockedOutAsync(user))
                {
                    throw new UnauthorizedAccessException(
                        $"{ErrorMessages.USER_LOCKED_OUT_UNTIL} {await _userManager.GetLockoutEndDateAsync(user)}.");
                }

                return new AuthenticationResult
                {
                    Succeed = false,
                    IsLockedOut = false,
                    User = user,
                };
            }
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
            
            if (result.Succeeded && requiresVerification)
            {
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                //string messageBody = string.Empty;

                //switch (verificationMethod)
                //{
                //    case RegistrationVerificationMethod.CODE_BASED:
                //        var otp = HelperMethods.GenerateRandomNumbers(6);
                //        var cacheKey = $"{AppConst.OTP_CACHE_KEY_PREFIX}_{user.Id}_{otp}";
                //        _memoryCache.Set(cacheKey, otp, TimeSpan.FromMinutes(5)); // Store OTP for 5 minutes
                //        messageBody = $"Your verification code is: <b>{otp}</b>";
                //        break;
                //    case RegistrationVerificationMethod.LINK_BASED:
                //        var requestScheme = _httpContextAccessor.HttpContext?.Request.Scheme;
                //        var requestHost = _httpContextAccessor.HttpContext?.Request.Host;
                //        var url = $"{requestScheme}://{requestHost}/verify-registration/{token}/{user.Id}";
                //        messageBody = $"Please verify your registration by clicking the link: <a href=\"{url}\">{url}</a>";
                //        break;
                //    default:
                //        break;
                //}

                //var message = new MessageStructureDto
                //{
                //    Subject = "Email Verification",
                //    Body = messageBody,
                //    IsHtmlBody = true,
                //};

                //await _notificationService.SendAsync(user.Email, message);

                //return true;

                return new RegistrationResult
                {
                    Succeeded = true,
                    User = user,
                    ConfirmationToken = token,
                    Message = "Registration successful. Please verify your email.",
                };
            }
            else if(result.Succeeded && !requiresVerification)
            {
                return new RegistrationResult
                {
                    Succeeded = true,
                    User = user,
                    ConfirmationToken = null,
                    Message = "Registration successful without email verification."
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
                User = null,
                ConfirmationToken = null,
                Message = stringBuilder.ToString()
            };
        }

        public async Task<AuthenticationResult> VerifyRegistrationAsync(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId) ??
                throw new InvalidOperationException("User not found");
            var result = await _userManager.ConfirmEmailAsync(user, token);

            return new AuthenticationResult
            {
                Succeed = result.Succeeded,
                IsLockedOut = false,
                User = user
            };
        }

        public async Task<bool> GenerateResetPasswordTokenAsync(string email)
        {
            var user = _userManager.FindByEmailAsync(email)
                .GetAwaiter().GetResult() ?? throw new ArgumentException(ErrorMessages.USER_EMAIL_NOT_FOUND);

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            //TODO: send reset password link with the token and user Id
            throw new NotImplementedException("Reset password token generation is still under development.");
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordRequestDto resetPasswordRequest)
        {
            var user = await _userManager.FindByIdAsync(resetPasswordRequest.UserId)
                ?? throw new ArgumentException("User not found");
            var result = await _userManager.ResetPasswordAsync(user, resetPasswordRequest.Token, resetPasswordRequest.NewPassword);
            return result.Succeeded;
        }
    }
}
