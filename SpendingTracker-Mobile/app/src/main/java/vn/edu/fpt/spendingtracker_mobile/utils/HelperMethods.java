package vn.edu.fpt.spendingtracker_mobile.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class HelperMethods {
    private static final String ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

    // Convert from UTC string to local Date object
    public static Date utcToLocal(String utcDateStr) {
        SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT, Locale.getDefault());
        sdf.setTimeZone(TimeZone.getTimeZone(AppConstants.UTC_NAME));
        try {
            return sdf.parse(utcDateStr);
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Convert from local Date object to UTC string
    public static String localToUtc(Date localDate) {
        SimpleDateFormat sdf = new SimpleDateFormat(ISO_FORMAT, Locale.getDefault());
        sdf.setTimeZone(TimeZone.getTimeZone(AppConstants.UTC_NAME));
        return sdf.format(localDate);
    }
}
