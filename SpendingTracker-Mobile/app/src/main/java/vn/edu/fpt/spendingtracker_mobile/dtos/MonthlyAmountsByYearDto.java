package vn.edu.fpt.spendingtracker_mobile.dtos;

import java.math.BigDecimal;
import java.util.Map;

public class MonthlyAmountsByYearDto {
    public int year;
    public Map<Integer, BigDecimal> monthlyIncomes;
    public Map<Integer, BigDecimal> monthlyExpenses;

    public MonthlyAmountsByYearDto() {
    }

    public MonthlyAmountsByYearDto(int year, Map<Integer, BigDecimal> monthlyIncomes, Map<Integer, BigDecimal> monthlyExpenses) {
        this.year = year;
        this.monthlyIncomes = monthlyIncomes;
        this.monthlyExpenses = monthlyExpenses;
    }
}
