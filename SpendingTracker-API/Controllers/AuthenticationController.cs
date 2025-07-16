using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SpendingTracker_API.Authentication.PasswordAuthentication;
using SpendingTracker_API.DTOs.Web_Mobile;
using SpendingTracker_API.Entities;
using SpendingTracker_API.Services.AuthTokenService;
using SpendingTracker_API.Utils.Messages;

namespace SpendingTracker_API.Controllers
{
    [ApiController, Route("api/auth")]
    public class AuthenticationController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IPasswordAuth _passwordAuth;
        private readonly IAuthTokenService _authTokenService;

        public AuthenticationController(UserManager<AppUser> userManager, IPasswordAuth passwordAuth, IAuthTokenService authTokenService)
        {
            _userManager = userManager;
            _passwordAuth = passwordAuth;
            _authTokenService = authTokenService;
        }

        [HttpPost("sign-in")]
        public async Task<IActionResult> DefaultSignIn([FromBody] PasswordCredentialsDto passwordCredentials)
        {
            try
            {
                var authResult = await _passwordAuth.AuthenticateAsync(passwordCredentials);
                if (authResult.Succeed)
                {
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
        public async Task<IActionResult> DefaultSignUp([FromBody] PasswordCredentialsDto passwordCredentials)
        {
            try
            {
                var registrationResult = await _passwordAuth.RegisterAsync(passwordCredentials, false);
                if (registrationResult.Succeed)
                {
                    Console.WriteLine("Registration completed");
                    var jwtToken = _authTokenService.GenerateToken(registrationResult.User);
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
        public async Task<IActionResult> GoogleSignIn([FromBody] GoogleIdTokenDto dto)
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
    }
}
