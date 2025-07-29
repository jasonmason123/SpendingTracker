namespace SpendingTracker_API.Utils
{
    public class AppConst
    {
        public const string OTP_CACHE_KEY_PREFIX = "otp";

        //Auth cookie
        public const string JWT_COOKIE_KEY = "user_session";
        public const int JWT_COOKIE_EXPIRATION_IN_DAYS = 7;

        //Authentication schemes
        public const string JWT_ONLY_AUTH_SCHEME = "JwtOnly";
        public const string COOKIE_ONLY_AUTH_SCHEME = "CookieOnly";
    }
}
