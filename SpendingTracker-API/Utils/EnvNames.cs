namespace SpendingTracker_API.Utils
{
    public class EnvNames
    {
        // Postgres database configuration
        public const string POSTGRES_CONNECTION_STRING = "POSTGRES__CONNECTION_STRING";

        // Gmail SMTP configuration
        public const string GMAIL_SMTP_CLIENT_DOMAIN = "GMAIL__SMTP_CLIENT_DOMAIN";
        public const string GMAIL_FROM = "GMAIL__FROM";
        public const string GMAIL_APP_PASS = "GMAIL__APP_PASS";
        public const string GMAIL_CLIENT_PORT = "GMAIL__CLIENT_PORT";

        // JWT configuration
        public const string JWT_SECRET_KEY = "JWT__SECRET_KEY";

        // Google OAuth configuration
        public const string GOOGLE_CLIENT_ID = "GOOGLE__CLIENT_ID";
        public const string GOOGLE_CLIENT_SECRET = "GOOGLE__CLIENT_SECRET";
    }
}
