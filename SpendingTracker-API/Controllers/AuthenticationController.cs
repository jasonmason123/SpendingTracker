using Google.Apis.Auth;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Services.AuthTokenService;
using SpendingTracker_API.Utils.Messages;
using System.Security.Claims;
using SpendingTracker_API.Utils.Enums;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Text;
using System.Text.Json;

namespace SpendingTracker_API.Controllers
{
    [ApiController, Route("api/auth")]
    public class AuthenticationController : ControllerBase
    {
        private const string IS_LOGGED_IN_COOKIE_KEY = "isLoggedIn";
        private const string USER_INFO_COOKIE_KEY = "userInfo";
        private const string WEB_INDEX_ROUTE = "/app";

        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IPasswordAuth _passwordAuth;
        private readonly IAuthTokenService _authTokenService;

        public AuthenticationController(UserManager<AppUser> userManager, IConfiguration configuration, IPasswordAuth passwordAuth, IAuthTokenService authTokenService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _passwordAuth = passwordAuth;
            _authTokenService = authTokenService;
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> DefaultSignIn(
            [FromBody] PasswordCredentialsDto passwordCredentials,
            [FromQuery] bool? remember = false,
            [FromQuery] bool? isWeb = false
        )
        {
            try
            {
                var authResult = await _passwordAuth.AuthenticateAsync(passwordCredentials);
                if (authResult.Succeed)
                {

                    // If it's a web request, set cookies and return Ok
                    if(isWeb == true)
                    {
                        await SetAuthCookies(authResult.User, remember ?? false);
                        Console.WriteLine("Signed in successfully");
                        return Ok();
                    }
                    var jwtToken = _authTokenService.GenerateToken(authResult.User);
                    Console.WriteLine("Signed in successfully");

                    return Ok(new
                    {
                        message = "Signed in successfully",
                        token = jwtToken,
                    });
                }

                Console.WriteLine("Invalid email or password.");
                return Unauthorized("Invalid email or password.");
            }
            catch(UnauthorizedAccessException ex)
            {
                Console.WriteLine($"Unauthorized exception: {ex}");
                return Unauthorized(ex.Message);
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"Argument exception: {ex}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sign-in error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> DefaultSignUp(
            [FromBody] PasswordCredentialsDto passwordCredentials,
            [FromQuery] bool? isWeb = false
        )
        {
            try
            {
                var registrationResult = await _passwordAuth.RegisterAsync(passwordCredentials, false);
                if (registrationResult.Succeed)
                {

                    // If it's a web request, set cookies and return Ok
                    if (isWeb == true)
                    {
                        await SetAuthCookies(registrationResult.User, false);
                        Console.WriteLine("Registration completed");
                        return Ok();
                    }

                    var jwtToken = _authTokenService.GenerateToken(registrationResult.User);
                    Console.WriteLine("Registration completed");

                    return Ok(new
                    {
                        message = "Signed up successfully",
                        token = jwtToken,
                    });
                }
                Console.WriteLine($"Failed to register user: {registrationResult.Message}");
                return BadRequest(registrationResult.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sign-up error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        // OAuth workflow for mobile:
        // 1. The app uses Google Sign-In SDK to open the Google login prompt.
        // 2. User chooses their Google account.
        // 3.Google returns a signed ID Token(JWT) to the Android app.
        // 4. The app sends the ID Token to the backend server.
        [HttpPost("google/mobile-sign-in")]
        public async Task<IActionResult> GoogleMobileSignIn([FromBody] GoogleIdTokenDto dto)
        {
            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken);
            }
            catch (Exception)
            {
                return Unauthorized("Invalid ID token.");
            }

            var email = payload.Email;
            var name = payload.Name;

            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized("Email is required.");
            }

            var user = await _userManager.FindByEmailAsync(email);
            if(user == null)
            {
                var credentials = new PasswordCredentialsDto
                {
                    Email = email,
                };

                // Create a new user if they don't exist
                var result = await _passwordAuth.RegisterAsync(credentials, false);

                if (!result.Succeed)
                {
                    return BadRequest("Failed to register user.");
                }

                user = result.User;
            }
            
            var jwtToken = _authTokenService.GenerateToken(user);

            return Ok(new
            {
                message = "Signed in successfully",
                token = jwtToken,
            });
        }

        // Oauth workflow for web, using cookies:
        [HttpGet("google/web-sign-in")]
        public IActionResult GoogleWebSignIn([FromQuery(Name = "remember")] bool? remember)
        {
            var redirectUrl = $"{Request.Scheme}://{Request.Host.Value}{Request.PathBase.Value}/api/auth/google/web-sign-in/callback";
            if (remember == true)
            {
                redirectUrl += "?remember=true";
            }
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google/web-sign-in/callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery(Name = "remember")] bool? remember)
        {
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);
            if (!result.Succeeded)
            {
                return Redirect($"{WEB_INDEX_ROUTE}/sign-in?error=OAuth%20failed");
            }

            var claims = result.Principal?.Identities.FirstOrDefault()?.Claims;
            var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (string.IsNullOrEmpty(email))
            {
                return Redirect($"{WEB_INDEX_ROUTE}/sign-in?error=Unable%20t%20get%20email%20from%20OAuth%20provider");
            }

            //if user exists, login
            var user = await _userManager.FindByEmailAsync(email);
            if (user != null)
            {
                await SetAuthCookies(user, remember ?? false);
                return Redirect(WEB_INDEX_ROUTE);
            }

            //if user not exist, register
            var newUser = new AppUser
            {
                Email = email,
                UserName = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? email,
                CreatedAt = DateTime.Now,
                FlagDel = FlagBoolean.FALSE,
            };

            await _userManager.CreateAsync(newUser);

            await SetAuthCookies(newUser, remember ?? false);
            return Redirect(WEB_INDEX_ROUTE);
        }

        [HttpGet("sign-out")]
        public async Task<IActionResult> SignOut()
        {
            try
            {
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                Response.Cookies.Delete(IS_LOGGED_IN_COOKIE_KEY);
                Console.WriteLine("Signed out successfully");
                return Ok(new { message = "Signed out successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Sign-out error: {ex}");
                return StatusCode(500, ErrorMessages.INTERNAL_SERVER_ERROR_MESSAGE);
            }
        }

        // Helper methods to set auth cookies
        private async Task SetAuthCookies(AppUser user, bool remember = false)
        {
            var expirationInMinutesString = _configuration["JwtSettings:ExpirationInMinutes"] ?? "";
            var expirationInMinutes = int.Parse(expirationInMinutesString);
            var expirationDateUtc = DateTimeOffset.UtcNow.AddMinutes(expirationInMinutes);

            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = remember,
                    ExpiresUtc = remember ? expirationDateUtc : null
                });

            // Add base64 userInfo cookie
            var userObj = new
            {
                username = user.UserName,
                email = user.Email
            };
            var json = JsonSerializer.Serialize(userObj);
            var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
            Response.Cookies.Append(USER_INFO_COOKIE_KEY, base64, new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = remember ? expirationDateUtc : null
            });

            // Add IsLoggedIn cookie
            Response.Cookies.Append(IS_LOGGED_IN_COOKIE_KEY, "true", new CookieOptions
            {
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = remember ? expirationDateUtc : null
            });
        }
    }
}
