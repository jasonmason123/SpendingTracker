package vn.edu.fpt.spendingtracker_mobile.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.text.SimpleDateFormat;
import java.util.Locale;

public class AppConstants {
    public static final String DATABASE_NAME = "SpendingTrackerDb";
    public static final String TRANSACTION_TABLE_NAME = "transactions";
    public static final String API_DOMAIN = "https://spendingtracker-bsov.onrender.com/";
    public static final String AUTH_PREFERENCE_NAME = "auth";
    public static final String AUTH_TOKEN_NAME = "authToken";
    public static final String AUTH_EMAIL = "authEmail";
    public static final SimpleDateFormat simpleDateFormat =
            new SimpleDateFormat("dd-MM-yyyy", Locale.getDefault());
    public static final String UTC_NAME = "UTC";
    public static final String ISO_UTC_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";
    public static final Gson GSON_CONFIG = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            .enableComplexMapKeySerialization()
            .setPrettyPrinting()
            .disableHtmlEscaping()
            .create();
}
