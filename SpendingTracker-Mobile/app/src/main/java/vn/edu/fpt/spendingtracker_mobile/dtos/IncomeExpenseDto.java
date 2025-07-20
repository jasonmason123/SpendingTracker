package vn.edu.fpt.spendingtracker_mobile.dtos;

import java.math.BigDecimal;

public class IncomeExpenseDto {
    private BigDecimal income;
    private BigDecimal expense;

    public IncomeExpenseDto(BigDecimal income, BigDecimal expense) {
        this.income = income;
        this.expense = expense;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public BigDecimal getExpense() {
        return expense;
    }
}
