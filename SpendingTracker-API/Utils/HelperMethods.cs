using System.Text;

namespace SpendingTracker_API.Utils
{
    public class HelperMethods
    {
        public static string GenerateRandomNumbers(int length)
        {
            StringBuilder builder = new StringBuilder();
            Random random = new Random();

            for (int i = 0; i < length; i++)
            {
                int digit = random.Next(0, 10);
                builder.Append(digit);
            }

            return builder.ToString();
        }
    }
}
