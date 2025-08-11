namespace SpendingTracker_API.DTOs.Statistics
{
    public class IncomeExpenseSummaryResult : IncomeExpenseResult
    {
        public decimal IncomeChange { get; set; }
        public decimal ExpenseChange { get; set; }
        public decimal Rollover { get; set; }
    }
}
