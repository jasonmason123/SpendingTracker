package vn.edu.fpt.spendingtracker_mobile.utils;

import com.github.mikephil.charting.formatter.ValueFormatter;
import com.github.mikephil.charting.data.BarEntry;

import java.text.NumberFormat;
import java.util.Locale;

public class LocaleCurrencyFormatter extends ValueFormatter {
    private final NumberFormat currencyFormat;

    public LocaleCurrencyFormatter(Locale locale) {
        currencyFormat = NumberFormat.getCurrencyInstance(locale);
        currencyFormat.setMaximumFractionDigits(0); // Set this based on how precise you want
    }

    @Override
    public String getBarLabel(BarEntry barEntry) {
        return currencyFormat.format(barEntry.getY());
    }
}
