// AddEditFragment.java
// Allows user to add a new contact or edit an existing one
package vn.edu.fpt.spendingtracker_mobile.fragments;

import android.app.Activity;
import android.app.DatePickerDialog;

import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import android.content.Context;
import android.content.SharedPreferences;
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
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

import okhttp3.OkHttpClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.spendingtracker_mobile.MainActivity;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.api_connector.AuthInterceptor;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.enums.TransactionTypes;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;
import vn.edu.fpt.spendingtracker_mobile.utils.HelperMethods;

public class AddEditFragment extends Fragment
{
    // callback method implemented by MainActivity
    public interface AddEditFragmentListener
    {
        // called after edit completed so contact can be redisplayed
        public void onAddEditCompleted(long rowID);
        public void onLogout();
    }

    private AddEditFragmentListener listener;

    private long rowID; // database row ID of the contact
    private Bundle transactionInfoBundle; // arguments for editing a transaction

    // EditTexts for contact information
    private EditText descriptionEditText;
    private EditText merchantEditText;
    private EditText dateEditText;
    private EditText amountEditText;
    private Spinner transactionTypeSpinner;
    private Retrofit retrofit;
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
                        String selectedDate = String.format("%04d-%02d-%02d", year, month + 1, dayOfMonth);
                        dateEditText.setText(selectedDate);
                    },
                    calendar.get(Calendar.YEAR),
                    calendar.get(Calendar.MONTH),
                    calendar.get(Calendar.DAY_OF_MONTH)
            ).show();
        });

        // Set spinner options from the enum TransactionTypes
        String[] transactionTypes = Arrays.stream(TransactionTypes.values())
                .map(Enum::name)
                .toArray(String[]::new);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            getActivity(),
            android.R.layout.simple_spinner_item,
            transactionTypes
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        transactionTypeSpinner.setAdapter(adapter);

        //Get auth token
        SharedPreferences prefs =
                getActivity().getSharedPreferences(
                        AppConstants.AUTH_PREFERENCE_NAME,
                        Context.MODE_PRIVATE);

        //Attach auth token to request header
        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(new AuthInterceptor(prefs))
                .build();

        //Initialize api connector
        retrofit = new Retrofit.Builder()
                .baseUrl(AppConstants.API_DOMAIN)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        apiConnector = retrofit.create(TransactionApiConnector.class);

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
                // AsyncTask to save contact, then notify listener
//                AsyncTask<Object, Object, Object> saveContactTask =
//                        new AsyncTask<Object, Object, Object>()
//                        {
//                            @Override
//                            protected Object doInBackground(Object... params)
//                            {
//                                saveTransaction(); // save contact to the database
//                                return null;
//                            }
//
//                            @Override
//                            protected void onPostExecute(Object result)
//                            {
//                                // hide soft keyboard
//                                InputMethodManager imm = (InputMethodManager)
//                                        getActivity().getSystemService(
//                                                Context.INPUT_METHOD_SERVICE);
//                                imm.hideSoftInputFromWindow(
//                                        getView().getWindowToken(), 0);
//
//                                listener.onAddEditCompleted(rowID);
//                            }
//                        }; // end AsyncTask
//
//                // save the contact to the database using a separate thread
//                saveContactTask.execute((Object[]) null);

                SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                // Parse to UTC date since server only accepts UTC date
                Date date = null;
                try {
                    date = format.parse(dateStr);
                } catch (ParseException e) {
                    e.printStackTrace(); // handle the error properly in production
                }

                double amount = Double.parseDouble(amountStr);

                TransactionTypes transactionType = TransactionTypes.valueOf(
                    transactionTypeSpinner.getSelectedItem().toString().toUpperCase()
                );

                saveTransaction(
                    new Transaction(
                        description, merchant, date, amount, transactionType));
            }
            else // required fields are blank, so display error dialog
            {
                new AlertDialog.Builder(requireContext())
                        .setMessage(R.string.error_message)
                        .setPositiveButton(R.string.ok, null)
                        .show();
            }
        } // end method onClick
    }; // end OnClickListener saveContactButtonClicked

    private void saveTransaction(Transaction transaction) {
        apiConnector.add(transaction).enqueue(new Callback<Transaction>() {
            @Override
            public void onResponse(Call<Transaction> call, Response<Transaction> response) {
                if (response.isSuccessful()) {
                    Log.d("SaveTransaction", "Transaction saved: " + response.body().getId());
                    // Optionally notify activity or pop back stack
                    requireActivity().getSupportFragmentManager().popBackStack();
                } else {
                    try {
                        Log.e("SaveTransaction", "Failed: " + response.errorBody().string());
                    } catch (IOException e) {
                        Log.e("SaveTransaction", "Error parsing errorBody");
                    }
                }
            }

            @Override
            public void onFailure(Call<Transaction> call, Throwable t) {
                Log.e("SaveTransaction", "Error: " + t.getMessage());
            }
        });
    }

    // saves contact information to the database
//    private void saveTransaction()
//    {
//        // get DatabaseConnector to interact with the SQLite database
//        SQLiteConnector sqliteConnector =
//                new SQLiteConnector(getActivity());
//
//        //Format the date entered
//        String dateStr = dateEditText.getText().toString();
//        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
//        Date date = null;
//        try {
//            date = format.parse(dateStr);
//        } catch (ParseException e) {
//            e.printStackTrace(); // handle the error properly in production
//        }
//
//        if (transactionInfoBundle == null)
//        {
//            // insert the contact information into the database
//            rowID = sqliteConnector.insertTransaction(
//                    descriptionEditText.getText().toString(),
//                    merchantEditText.getText().toString(),
//                    date,
//                    Double.parseDouble(amountEditText.getText().toString()),
//                    TransactionTypes.valueOf(
//                        transactionTypeSpinner.getSelectedItem().toString().toUpperCase()
//                    ));
//        }
//        else
//        {
//            sqliteConnector.updateTransaction(rowID,
//                descriptionEditText.getText().toString(),
//                merchantEditText.getText().toString(),
//                date,
//                Double.parseDouble(amountEditText.getText().toString()),
//                TransactionTypes.valueOf(
//                    transactionTypeSpinner.getSelectedItem().toString().toUpperCase()
//                ));
//        }
//    } // end method saveContact
} // end class AddEditFragment