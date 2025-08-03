namespace SpendingTracker_API.Utils
{
    public class AppConst
    {
        //OTP
        public const string OTP_CACHE_KEY_PREFIX = "46ec1e05f1c82f7be23eec90d1df8ed5cce8d19";
        public const int OTP_MAX_FAILED_ATTEMPTS = 5;
        public const int OTP_TIME_EXPIRED_IN_MINUTES = 5;

        //Auth cookie
        public const string JWT_COOKIE_KEY = "user_session";
        public const int JWT_COOKIE_EXPIRATION_IN_DAYS = 7;

        //Page number and page size
        public const int DEFAULT_PAGE_NUMBER = 1;
        public const int DEFAULT_PAGE_SIZE = 10;
    }
}
