package vn.edu.fpt.spendingtracker_mobile.api_connector;

import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Query;
import vn.edu.fpt.spendingtracker_mobile.dtos.IncomeExpenseDto;
import vn.edu.fpt.spendingtracker_mobile.dtos.MonthlyAmountsByYearDto;

public interface StatisticsApiConnector {
    @GET("api/statistics/get-income-expense-by-period")
    Call<IncomeExpenseDto> getIncomeExpenseByPeriod(
            @Query("dateFrom") String dateFromString,
            @Query("dateTo") String dateToString
    );

    @GET("api/statistics/amounts/monthly-by-year")
    Call<MonthlyAmountsByYearDto> getMonthlyAmountsByYear(@Query("year") int year);
}
