package vn.edu.fpt.spendingtracker_mobile.dialog_fragment;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

import java.io.IOException;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import vn.edu.fpt.spendingtracker_mobile.SQLiteConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.fragments.DetailsFragment;
import vn.edu.fpt.spendingtracker_mobile.R;

public class ConfirmDeleteDialogFragment extends DialogFragment {

    private static final String ARG_ROW_ID = "row_id";
    private long rowID;
    private DetailsFragment.DetailsFragmentListener listener;
    private TransactionApiConnector apiConnector;

    public static ConfirmDeleteDialogFragment newInstance(long rowID) {
        ConfirmDeleteDialogFragment fragment = new ConfirmDeleteDialogFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_ROW_ID, rowID);
        fragment.setArguments(args);
        return fragment;
    }

    public void setListener(DetailsFragment.DetailsFragmentListener listener) {
        this.listener = listener;
    }

    public void setApiConnector(TransactionApiConnector apiConnector) {
        this.apiConnector = apiConnector;
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        if (getArguments() != null) {
            rowID = getArguments().getLong(ARG_ROW_ID);
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(requireContext());
        builder.setTitle(R.string.confirm_title);
        builder.setMessage(R.string.confirm_message);

        builder.setPositiveButton(R.string.button_delete, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int button) {
                apiConnector.delete((int) rowID).enqueue(new Callback<Transaction>() {
                    @Override
                    public void onResponse(Call<Transaction> call, Response<Transaction> response) {
                        if (response.isSuccessful()) {
                            listener.onTransactionDeleted();
                        } else {
                            builder.setMessage(R.string.error_deleting_transaction_message);
                            try {
                                Log.e("DeleteTransaction",
                                        response.code() + ": " + response.errorBody().string());
                            } catch (IOException e) {
                                Log.e("DeleteTransaction", "Error parsing errorBody");
                            }
                        }
                    }

                    @Override
                    public void onFailure(Call<Transaction> call, Throwable t) {
                        Log.e("DeleteTransaction", "Error: " + t.getMessage());
                    }
                });
            }
        });

        builder.setNegativeButton(R.string.button_cancel, null);
        return builder.create();
    }
}
