package vn.edu.fpt.spendingtracker_mobile.api_connector.api_callback;

import android.content.Context;
import android.util.Log;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.utils.HelperMethods;

public abstract class ApiCallback<T> implements Callback<T> {
    private final Context context;

    public ApiCallback() {
        context = null;
    }

    public ApiCallback(Context context) {
        this.context = context;
    }

    @Override
    public void onFailure(Call<T> call, Throwable t) {
        Log.e("ApiCallback", "Error", t);
        if(context != null) {
            if(t instanceof IOException) {
                HelperMethods.showMessageDialog(
                        R.string.network_error_message, context);
            } else {
                HelperMethods.showMessageDialog(
                    R.string.api_error_message, context);
            }
        }
    }
}
