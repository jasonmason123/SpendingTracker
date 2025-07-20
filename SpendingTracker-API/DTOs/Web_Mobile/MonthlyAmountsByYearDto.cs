namespace SpendingTracker_API.DTOs.Web_Mobile
{
    public class MonthlyAmountsByYearDto
    {
        public int Year { get; set; }
        public Dictionary<int, decimal> MonthlyIncomes { get; set; } = new Dictionary<int, decimal>();
        public Dictionary<int, decimal> MonthlyExpenses { get; set; } = new Dictionary<int, decimal>();
    }
}
