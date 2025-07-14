// DetailsFragment.java
// Displays one contact's details
package vn.edu.fpt.spendingtracker_mobile.fragments;

import android.app.Activity;

import androidx.fragment.app.Fragment;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import java.util.Date;

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
import vn.edu.fpt.spendingtracker_mobile.dialog_fragment.ConfirmDeleteDialogFragment;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;
import vn.edu.fpt.spendingtracker_mobile.utils.HelperMethods;

public class DetailsFragment extends Fragment
{
    // callback methods implemented by MainActivity
    public interface DetailsFragmentListener
    {
        // called when a transaction is deleted
        public void onTransactionDeleted();

        // called to pass Bundle of transaction's info for editing
        public void onEditTransaction(Bundle arguments);
    }

    private DetailsFragmentListener listener;

    private long transactionId = -1; // selected transaction's ID
    private TextView descriptionTextView; // displays transaction's description
    private TextView merchantTextView; // displays transaction's merchant
    private TextView dateTextView; // displays transaction's date
    private TextView amountTextView; // displays transaction's amount
    private TextView transactionTypeTextView; // displays transaction type
    private Retrofit retrofit;
    private TransactionApiConnector apiConnector;

    // set DetailsFragmentListener when fragment attached
    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        listener = (DetailsFragmentListener) activity;
    }

    // remove DetailsFragmentListener when fragment detached
    @Override
    public void onDetach()
    {
        super.onDetach();
        listener = null;
    }

    // called when DetailsFragmentListener's view needs to be created
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        super.onCreateView(inflater, container, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes

        // if DetailsFragment is being restored, get saved row ID
        if (savedInstanceState != null)
            transactionId = savedInstanceState.getLong(MainActivity.TRANSACTION_ID);
        else
        {
            // get Bundle of arguments then extract the contact's row ID
            Bundle arguments = getArguments();

            if (arguments != null)
                transactionId = arguments.getLong(MainActivity.TRANSACTION_ID);
        }

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

        // inflate DetailsFragment's layout
        View view =
                inflater.inflate(R.layout.fragment_details, container, false);
        setHasOptionsMenu(true); // this fragment has menu items to display

        // get the EditTexts
        descriptionTextView = (TextView) view.findViewById(R.id.descriptionTextView);
        merchantTextView = (TextView) view.findViewById(R.id.merchantTextView);
        dateTextView = (TextView) view.findViewById(R.id.dateTextView);
        amountTextView = (TextView) view.findViewById(R.id.amountTextView);
        transactionTypeTextView = (TextView) view.findViewById(R.id.transactionTypeTextView);
        return view;
    }

    // called when the DetailsFragment resumes
    @Override
    public void onResume()
    {
        super.onResume();
        loadTransactionById(transactionId); // load contact at rowID
    }

    // save currently displayed contact's row ID
    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putLong(MainActivity.TRANSACTION_ID, transactionId);
    }

    // display this fragment's menu items
    @Override
    public void onCreateOptionsMenu(Menu menu, MenuInflater inflater)
    {
        super.onCreateOptionsMenu(menu, inflater);
        inflater.inflate(R.menu.fragment_details_menu, menu);
    }

    // handle menu item selections
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        int itemId = item.getItemId();
        if(itemId == R.id.action_edit) {
            // create Bundle containing contact data to edit
            Bundle arguments = new Bundle();
            arguments.putLong(MainActivity.TRANSACTION_ID, transactionId);
            arguments.putCharSequence("description", descriptionTextView.getText());
            arguments.putCharSequence("merchant", merchantTextView.getText());
            arguments.putCharSequence("date", dateTextView.getText());
            arguments.putCharSequence("amount", amountTextView.getText());
            arguments.putCharSequence("transactionType", transactionTypeTextView.getText());
            listener.onEditTransaction(arguments); // pass Bundle to listener
            return true;
        }
        if(itemId == R.id.action_delete) {
            deleteContact();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void loadTransactionById(long id) {
        int idInt = (int) id;
        Call<Transaction> call = apiConnector.get(idInt);
        call.enqueue(new Callback<Transaction>() {
            @Override
            public void onResponse(Call<Transaction> call, Response<Transaction> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Transaction t = response.body();

                    // Parsing date to local date since server returns UTC date
                    Date localDate = HelperMethods.utcToLocal(t.getDate().toString());

                    descriptionTextView.setText(t.getDescription());
                    merchantTextView.setText(t.getMerchant());
                    dateTextView.setText(localDate.toString());
                    amountTextView.setText(String.valueOf(t.getAmount()));
                    transactionTypeTextView.setText(t.getTransactionType().toString());
                } else {
                    // handle error (e.g. show toast or error text)
                }
            }

            @Override
            public void onFailure(Call<Transaction> call, Throwable t) {
                // handle network error
            }
        });
    }

    // performs database query outside GUI thread
//    private class LoadContactTask extends AsyncTask<Long, Object, Cursor>
//    {
//        SQLiteConnector sqLiteConnector =
//                new SQLiteConnector(getActivity());
//
//        // open database & get Cursor representing specified contact's data
//        @Override
//        protected Cursor doInBackground(Long... params)
//        {
//            sqLiteConnector.open();
//            return sqLiteConnector.getOneTransaction(params[0]);
//        }
//
//        // use the Cursor returned from the doInBackground method
//        @Override
//        protected void onPostExecute(Cursor result)
//        {
//            super.onPostExecute(result);
//            result.moveToFirst(); // move to the first item
//
//            // get the column index for each data item
//            int descriptionIndex = result.getColumnIndex("description");
//            int merchantIndex = result.getColumnIndex("merchant");
//            int dateIndex = result.getColumnIndex("date");
//            int amountIndex = result.getColumnIndex("amount");
//            int transactionTypeIndex = result.getColumnIndex("transactionType");
//
//            // fill TextViews with the retrieved data
//            descriptionTextView.setText(result.getString(descriptionIndex));
//            merchantTextView.setText(result.getString(merchantIndex));
//            dateTextView.setText(result.getString(dateIndex));
//            amountTextView.setText(result.getString(amountIndex));
//            transactionTypeTextView.setText(result.getString(transactionTypeIndex));
//
//            result.close(); // close the result cursor
//            sqLiteConnector.close(); // close database connection
//        } // end method onPostExecute
//    } // end class LoadContactTask

    // delete a contact
    private void deleteContact()
    {
        // use FragmentManager to display the confirmDelete DialogFragment
        ConfirmDeleteDialogFragment dialog = ConfirmDeleteDialogFragment.newInstance(transactionId);
        dialog.setListener(this.listener);
        dialog.show(getParentFragmentManager(), "confirmDelete");
    }
} // end class DetailsFragment