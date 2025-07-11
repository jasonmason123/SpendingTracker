package vn.edu.fpt.spendingtracker_mobile.dialog_fragment;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

import vn.edu.fpt.spendingtracker_mobile.DatabaseConnector;
import vn.edu.fpt.spendingtracker_mobile.DetailsFragment;
import vn.edu.fpt.spendingtracker_mobile.R;

public class ConfirmDeleteDialogFragment extends DialogFragment {

    private static final String ARG_ROW_ID = "row_id";
    private long rowID;
    private DetailsFragment.DetailsFragmentListener listener;

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
                DatabaseConnector databaseConnector = new DatabaseConnector(requireContext());

                new AsyncTask<Long, Void, Void>() {
                    @Override
                    protected Void doInBackground(Long... params) {
                        databaseConnector.deleteContact(params[0]);
                        return null;
                    }

                    @Override
                    protected void onPostExecute(Void result) {
                        if (listener != null) {
                            listener.onTransactionDeleted();
                        }
                    }
                }.execute(rowID);
            }
        });

        builder.setNegativeButton(R.string.button_cancel, null);
        return builder.create();
    }
}
