package vn.edu.fpt.spendingtracker_mobile.fragments.on_bottom_nav_fragments;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.NumberPicker;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.core.content.ContextCompat;

import com.github.mikephil.charting.charts.BarChart;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Response;
import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.api_connector.StatisticsApiConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.api_callback.ApiCallback;
import vn.edu.fpt.spendingtracker_mobile.dtos.IncomeExpenseDto;
import vn.edu.fpt.spendingtracker_mobile.dtos.MonthlyAmountsByYearDto;
import vn.edu.fpt.spendingtracker_mobile.fragments.base_fragment.BaseFragment;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;
import vn.edu.fpt.spendingtracker_mobile.utils.LocaleCurrencyFormatter;

public class StatisticsFragment extends BaseFragment {
    private final Locale LOCALE = new Locale("vi", "VN");
    private final int MIN_YEAR = 1900;
    private final int MAX_YEAR = 2100;
    private static final float GROUP_SPACE = 0.2f;
    private static final float BAR_SPACE = 0.05f;
    private static final float BAR_WIDTH = 0.31f;
    private static final int LABEL_COUNT = 12;
    private BarChart barChart;
    private EditText yearEditText;
    private TextView earningsTextView;
    private TextView expensesTextView;
    private TextView ratioText;
    private StatisticsApiConnector apiConnector;
    private int year = LocalDate.now().getYear();

    @Override
    protected boolean shouldShowBottomNavigation() {
        return true;
    }

    @Override
    protected boolean shouldDisplayBackButton() {
        return false;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_statistics, container, false);

        barChart = (BarChart) view.findViewById(R.id.barChart);
        yearEditText = (EditText) view.findViewById(R.id.yearEditText);
        earningsTextView = (TextView) view.findViewById(R.id.earningsTextView);
        expensesTextView = (TextView) view.findViewById(R.id.expensesTextView);
        ratioText = (TextView) view.findViewById(R.id.ratioText);

        yearEditText.setText(String.valueOf(year));
        apiConnector = MyApp.getApiConnector(StatisticsApiConnector.class);

        // Show numberPicker when clicking on yearEditText
        yearEditText.setOnClickListener(listen -> {
            Context context = requireContext();

            NumberPicker picker = new NumberPicker(context);
            picker.setMinValue(MIN_YEAR);
            picker.setMaxValue(MAX_YEAR);
            picker.setValue(year);

            AlertDialog.Builder builder = new AlertDialog.Builder(context);
            builder.setTitle(getString(R.string.hint_select_year));
            builder.setView(picker);
            builder.setPositiveButton("OK", (dialog, which) -> {
                year = picker.getValue();
                yearEditText.setText(String.valueOf(year));

                // Fetch data again upon changing the year
                getMonthlyAmountsByYear(year);
                getIncomeExpenseByYear(year);
            });
            builder.setNegativeButton("Cancel", null);

            builder.show();
        });

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        getMonthlyAmountsByYear(year);
        getIncomeExpenseByYear(year);
    }

    private void getMonthlyAmountsByYear(int year) {
        apiConnector.getMonthlyAmountsByYear(year)
            .enqueue(new ApiCallback<MonthlyAmountsByYearDto>(requireContext()) {
                @Override
                public void onResponse(Call<MonthlyAmountsByYearDto> call, Response<MonthlyAmountsByYearDto> response) {
                    if (response.isSuccessful() && response.body() != null) {
                        if(barChart.getData() == null) {
                            updateChartData(response.body(), barChart);
                            configureBarChart(barChart);
                        } else {
                            updateChartData(response.body(), barChart);
                        }
                        barChart.invalidate();
                    } else {
                        Log.e("getIncomeExpenseByYear", "Failed to load: "
                                + response.code() + ": "
                                + call.request().url());
                    }
                }
            });
    }


    private void getIncomeExpenseByYear(int year) {
        LocalDate firstDay = LocalDate.of(year, 1, 1);
        LocalDate lastDay = LocalDate.of(year, 12, 31);

        Date dateFrom = Date.from(firstDay.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date dateTo = Date.from(lastDay.atStartOfDay(ZoneId.systemDefault()).toInstant());

        SimpleDateFormat apiFormat =
                new SimpleDateFormat(AppConstants.ISO_UTC_DATE_FORMAT, Locale.getDefault());

        String from = apiFormat.format(dateFrom);
        String to = apiFormat.format(dateTo);

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(LOCALE);

        apiConnector.getIncomeExpenseCustomRange(from, to)
            .enqueue(new ApiCallback<IncomeExpenseDto>(requireContext()) {
                @Override
                public void onResponse(
                    Call<IncomeExpenseDto> call,
                    Response<IncomeExpenseDto> response
                ) {
                    if (response.isSuccessful() && response.body() != null) {
                        BigDecimal income = response.body().getIncome();
                        BigDecimal expense = response.body().getExpense();
                        String incomeText = getString(R.string.earningText)
                                + currencyFormat.format(income);
                        String expenseText = getString(R.string.expenseText)
                                + currencyFormat.format(expense);
                        earningsTextView.setText(incomeText);
                        expensesTextView.setText(expenseText);

                        BigDecimal diff = income.subtract(expense);
                        String ratio = (diff.doubleValue() >= 0 ?
                                getString(R.string.remainingText) :
                                getString(R.string.overspentText)) +
                                currencyFormat.format(diff);

                        ratioText.setText(ratio);
                        ratioText.setTextColor(
                                ContextCompat.getColor(requireContext(),
                                        diff.doubleValue() >= 0 ? R.color.green : R.color.red));
                    } else {
                        try {
                            Log.e("getIncomeExpenseByMonth",
                                    response.code() + ": " + response.errorBody().string());
                        } catch (IOException e) {
                            Log.e("getIncomeExpenseByMonth", "Error parsing errorBody");
                        }
                    }
                }
            });
    }

    private void configureBarChart(BarChart barChart) {
        // X-Axis setup
        XAxis xAxis = barChart.getXAxis();
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setDrawGridLines(false);
        xAxis.setGranularity(1f);
        xAxis.setLabelCount(LABEL_COUNT);
        xAxis.setTextSize(12f);
        xAxis.setValueFormatter(new IndexAxisValueFormatter(new String[]{
                "01/" + year, "02/" + year, "03/" + year,
                "04/" + year, "05/" + year, "06/" + year,
                "07/" + year, "08/" + year, "09/" + year,
                "10/" + year, "11/" + year, "12/" + year
        }));

        barChart.getAxisRight().setEnabled(false);
        barChart.getDescription().setEnabled(false);

        // Enable interaction
        barChart.setScaleEnabled(true);
        barChart.setPinchZoom(true);
        barChart.setDragEnabled(true);
        barChart.setDoubleTapToZoomEnabled(true);
        barChart.setVisibleXRangeMaximum(4);
        barChart.animateY(1000);

        // Configure legend position
        Legend legend = barChart.getLegend();
        legend.setVerticalAlignment(Legend.LegendVerticalAlignment.TOP);
        legend.setHorizontalAlignment(Legend.LegendHorizontalAlignment.CENTER);
        legend.setOrientation(Legend.LegendOrientation.HORIZONTAL);
        legend.setDrawInside(false);
    }

    private void updateChartData(MonthlyAmountsByYearDto data, BarChart barChart) {
        if(barChart == null) {
            Log.e("updateChartData", "Bar chart is not initialized");
            return;
        }

        Map<Integer, BigDecimal> serverIncomeMap = data.monthlyIncomes;
        Map<Integer, BigDecimal> serverExpenseMap = data.monthlyExpenses;

        List<BarEntry> incomeEntries = new ArrayList<>();
        List<BarEntry> expenseEntries = new ArrayList<>();

        for (int i = 0; i < LABEL_COUNT; i++) {
            int month = i + 1; // months are 1-based
            BigDecimal income = serverIncomeMap.getOrDefault(month, BigDecimal.ZERO);
            BigDecimal expense = serverExpenseMap.getOrDefault(month, BigDecimal.ZERO);

            incomeEntries.add(new BarEntry(i, income.floatValue()));
            expenseEntries.add(new BarEntry(i, expense.floatValue()));
        }

        BarDataSet incomeSet = new BarDataSet(incomeEntries, "Income");
        incomeSet.setColor(Color.GREEN);

        BarDataSet expenseSet = new BarDataSet(expenseEntries, "Expense");
        expenseSet.setColor(Color.RED);

        BarData barData = new BarData(incomeSet, expenseSet);
        barData.setBarWidth(BAR_WIDTH); // width of each bar
        barData.setValueTextSize(10f);
        barData.setValueFormatter(new LocaleCurrencyFormatter(LOCALE));

        barChart.setData(barData);

        // Set X Axis
        barChart.getXAxis().setAxisMinimum(0f);
        barChart.getXAxis().setAxisMaximum(
                0f + barChart.getBarData().getGroupWidth(GROUP_SPACE, BAR_SPACE) * LABEL_COUNT);
        barChart.groupBars(0f, GROUP_SPACE, BAR_SPACE); // Important for grouped bar

        barChart.notifyDataSetChanged();

        // Move to current month if the selected year is the current year
        if(year == LocalDate.now().getYear()) {
            int prevMonthIndex = LocalDate.now().getMonthValue() - 2;
            barChart.moveViewToX(prevMonthIndex);
        } else {
            barChart.moveViewToX(0f);
        }
    }
}
