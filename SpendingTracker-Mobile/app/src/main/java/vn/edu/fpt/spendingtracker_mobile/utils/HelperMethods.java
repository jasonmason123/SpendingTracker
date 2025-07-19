package vn.edu.fpt.spendingtracker_mobile.utils;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.StringRes;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.FragmentActivity;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import okhttp3.OkHttpClient;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.api_connector.AuthInterceptor;

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

    public static void showMessageDialog(@StringRes int messageId, Context context) {
        new AlertDialog.Builder(context)
                .setMessage(messageId)
                .setPositiveButton(R.string.ok, null)
                .show();
    }
}
