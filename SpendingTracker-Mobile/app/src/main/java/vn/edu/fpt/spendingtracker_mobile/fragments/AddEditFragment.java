// AddEditFragment.java
// Allows user to add a new contact or edit an existing one
package vn.edu.fpt.spendingtracker_mobile.fragments;

import android.app.Activity;
import android.app.DatePickerDialog;

import androidx.annotation.StringRes;
import androidx.fragment.app.Fragment;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import vn.edu.fpt.spendingtracker_mobile.MainActivity;
import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.api_callback.ApiCallback;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.enums.TransactionType;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;
import vn.edu.fpt.spendingtracker_mobile.utils.HelperMethods;

public class AddEditFragment extends BaseFragment
{
    @Override
    protected boolean shouldShowBottomNavigation() {
        return false;
    }

    // callback method implemented by MainActivity
    public interface AddEditFragmentListener
    {
        // called after edit completed so contact can be redisplayed
        public void onAddEditCompleted(long rowID);
    }

    private final String DATE_PICKER_STRING_FORMAT = "%02d-%02d-%04d";
    private final String SIMPLE_DATE_FORMAT = "dd-MM-yyyy";

    private AddEditFragmentListener listener;

    private long rowID; // database row ID of the contact
    private Bundle transactionInfoBundle; // arguments for editing a transaction

    // EditTexts for contact information
    private EditText descriptionEditText;
    private EditText merchantEditText;
    private EditText dateEditText;
    private EditText amountEditText;
    private Spinner transactionTypeSpinner;
    private TransactionApiConnector apiConnector;

    // set AddEditFragmentListener when Fragment attached
    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        listener = (AddEditFragmentListener) activity;
    }

    // remove AddEditFragmentListener when Fragment detached
    @Override
    public void onDetach()
    {
        super.onDetach();
        listener = null;
    }

    // called when Fragment's view needs to be created
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        super.onCreateView(inflater, container, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes
        setHasOptionsMenu(true); // fragment has menu items to display

        // inflate GUI and get references to EditTexts
        View view = inflater.inflate(R.layout.fragment_add_edit, container, false);
        descriptionEditText = (EditText) view.findViewById(R.id.descriptionEditText);
        merchantEditText = (EditText) view.findViewById(R.id.merchantEditText);
        dateEditText = (EditText) view.findViewById(R.id.dateEditText);
        amountEditText = (EditText) view.findViewById(R.id.amountEditText);
        transactionTypeSpinner = (Spinner) view.findViewById(R.id.transactionTypeSpinner);

        //Set date picker popup for dateEditText
        dateEditText.setOnClickListener(v -> {
            Calendar calendar = Calendar.getInstance();

            new DatePickerDialog(
                v.getContext(),
                (datePicker, year, month, dayOfMonth) -> {
                    String selectedDate = String.format(DATE_PICKER_STRING_FORMAT, dayOfMonth, month + 1, year);
                    dateEditText.setText(selectedDate);
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
            ).show();
        });

        // Set spinner options from the enum TransactionTypes
        String[] transactionTypes = Arrays.stream(TransactionType.values())
                .map(Enum::name)
                .toArray(String[]::new);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            getActivity(),
            android.R.layout.simple_spinner_item,
            transactionTypes
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        transactionTypeSpinner.setAdapter(adapter);

        // Initialize apiConnector
        apiConnector = MyApp.getApiConnector(TransactionApiConnector.class);

        transactionInfoBundle = getArguments(); // null if creating new transaction

        if (transactionInfoBundle != null)
        {
            rowID = transactionInfoBundle.getLong(MainActivity.TRANSACTION_ID);
            descriptionEditText.setText(transactionInfoBundle.getString("description"));
            merchantEditText.setText(transactionInfoBundle.getString("merchant"));
            dateEditText.setText(transactionInfoBundle.getString("date"));
            amountEditText.setText(transactionInfoBundle.getString("amount"));
            String transactionType = transactionInfoBundle.getString("transactionType");
            if (transactionType != null && adapter != null) {
                int position = adapter.getPosition(transactionType);
                if (position >= 0) {
                    transactionTypeSpinner.setSelection(position);
                }
            }
            //Unable to edit transaction type
            transactionTypeSpinner.setEnabled(false);
        }

        // set Save Contact Button's event listener
        Button saveContactButton =
                (Button) view.findViewById(R.id.saveTransactionButton);
        saveContactButton.setOnClickListener(saveTransactionButtonClicked);
        return view;
    }

    // responds to event generated when user saves a contact
    OnClickListener saveTransactionButtonClicked = new OnClickListener()
    {
        @Override
        public void onClick(View v)
        {
            String description = descriptionEditText.getText().toString().trim();
            String merchant = merchantEditText.getText().toString().trim();
            String dateStr = dateEditText.getText().toString().trim();
            String amountStr = amountEditText.getText().toString().trim();

            if (description.length() != 0 && merchant.length() != 0 &&
                dateStr.length() != 0 && amountStr.length() != 0 &&
                transactionTypeSpinner.getSelectedItem() != null)
            {
                SimpleDateFormat format =
                        new SimpleDateFormat(SIMPLE_DATE_FORMAT, Locale.getDefault());
                Date date = null;
                try {
                    date = format.parse(dateStr);
                } catch (ParseException e) {
                    e.printStackTrace(); // handle the error properly in production
                }

                BigDecimal amount = new BigDecimal(amountStr);

                TransactionType transactionType = TransactionType.valueOf(
                    transactionTypeSpinner.getSelectedItem().toString().toUpperCase()
                );

                saveTransaction(
                    new Transaction(
                        description, merchant, date, amount, transactionType));
            }
            else // required fields are blank, so display error dialog
            {
                showMessageDialog(R.string.error_message);
            }
        } // end method onClick
    }; // end OnClickListener saveContactButtonClicked

    private void saveTransaction(Transaction transaction) {
        if(transactionInfoBundle != null) {
            apiConnector.update((int) rowID, transaction).enqueue(new Callback<Transaction>() {
                @Override
                public void onResponse(Call<Transaction> call, Response<Transaction> response) {
                    if (response.isSuccessful()) {
                        Log.d("UpdateTransaction",
                                response.code() + ": Transaction updated: " + response.body().getId());
                        showMessageDialog(R.string.transaction_saved_message);
                        // Optionally notify activity or pop back stack
                        listener.onAddEditCompleted(rowID);
                    } else {
                        showMessageDialog(R.string.error_saving_transaction_message);
                        try {
                            Log.e("UpdateTransaction",
                                    response.code() + ": " + response.errorBody().string());
                        } catch (IOException e) {
                            Log.e("UpdateTransaction", "Error parsing errorBody");
                        }
                    }
                }

                @Override
                public void onFailure(Call<Transaction> call, Throwable t) {
                    showMessageDialog(R.string.error_saving_transaction_message);
                    Log.e("UpdateTransaction", "Error: " + t.getMessage());
                }
            });
        } else {
            apiConnector.add(transaction).enqueue(new ApiCallback<Transaction>(requireContext()) {
                @Override
                public void onResponse(Call<Transaction> call, Response<Transaction> response) {
                    if (response.isSuccessful()) {
                        Log.d("AddTransaction",
                                response.code() + ": Transaction added: " + response.body().getId());
                        showMessageDialog(R.string.transaction_saved_message);
                        // Optionally notify activity or pop back stack
                        listener.onAddEditCompleted(rowID);
                    } else {
                        showMessageDialog(R.string.error_saving_transaction_message);
                        try {
                            Log.e("AddTransaction",
                                    response.code() + ": " + response.errorBody().string());
                        } catch (IOException e) {
                            Log.e("AddTransaction", "Error parsing errorBody");
                        }
                    }
                }

                @Override
                public void onFailure(Call<Transaction> call, Throwable t) {
                    Log.e("AddTransaction", "Error: " + t.getMessage());
                }
            });
        }
    }

    private void showMessageDialog(@StringRes int messageId) {
        HelperMethods.showMessageDialog(messageId, requireContext());
    }
} // end class AddEditFragment