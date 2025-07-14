// ContactListFragment.java
// Displays the list of contact names
package vn.edu.fpt.spendingtracker_mobile.fragments;

import android.app.Activity;
import androidx.fragment.app.ListFragment;

import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.CursorAdapter;
import android.widget.ListView;
import android.widget.SimpleCursorAdapter;

import java.util.ArrayList;
import java.util.List;

import okhttp3.OkHttpClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.SQLiteConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.AuthInterceptor;
import vn.edu.fpt.spendingtracker_mobile.api_connector.AuthenticationApiConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class TransactionListFragment extends ListFragment
{
    // callback methods implemented by MainActivity
    public interface TransactionListFragmentListener
    {
        // called when user selects a contact
        public void onTransactionSelected(long rowID);

        // called when user decides to add a contact
        public void onAddTransaction();
    }

    private TransactionListFragmentListener listener;
    private List<Transaction> transactionList = new ArrayList<>();
    private ArrayAdapter<String> transactionAdapter;

    private ListView transactionListView; // the ListActivity's ListView
    //private CursorAdapter transactionAdapter; // adapter for ListView
    private Retrofit retrofit;
    private TransactionApiConnector apiConnector;

    // set ContactListFragmentListener when fragment attached
    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        listener = (TransactionListFragmentListener) activity;
    }

    // remove ContactListFragmentListener when Fragment detached
    @Override
    public void onDetach()
    {
        super.onDetach();
        listener = null;
    }

    // called after View is created
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState)
    {
        super.onViewCreated(view, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes
        setHasOptionsMenu(true); // this fragment has menu items to display

        // set text to display when there are no contacts
        setEmptyText(getResources().getString(R.string.no_transactions));

        // get ListView reference and configure ListView
        transactionListView = getListView();
        transactionListView.setOnItemClickListener(viewTransactionListener);
        transactionListView.setChoiceMode(ListView.CHOICE_MODE_SINGLE);

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

        // map each contact's name to a TextView in the ListView layout
//        String[] from = new String[] { "description", "amount", "date" };
//        int[] to = new int[] { android.R.id.text1 };
//        transactionAdapter = new SimpleCursorAdapter(getActivity(),
//                android.R.layout.simple_list_item_1, null, from, to, 0);
//        setListAdapter(transactionAdapter); // set adapter that supplies data

        // Set listener on clicking a row
        getListView().setOnItemClickListener((parent, v, position, id) -> {
            Transaction selected = transactionList.get(position);
            listener.onTransactionSelected(selected.getId());
        });
    }

    // responds to the user touching a contact's name in the ListView
    OnItemClickListener viewTransactionListener = new OnItemClickListener()
    {
        @Override
        public void onItemClick(AdapterView<?> parent, View view,
                                int position, long id)
        {
            listener.onTransactionSelected(id); // pass selection to MainActivity
        }
    }; // end viewContactListener

    // when fragment resumes, use a GetContactsTask to load contacts
    @Override
    public void onResume()
    {
        super.onResume();
//        new GetContactsTask().execute((Object[]) null);
        fetchTransactionsFromApi();
    }

    private void fetchTransactionsFromApi() {
        apiConnector.getList(1, 10).enqueue(new Callback<List<Transaction>>() {
            @Override
            public void onResponse(Call<List<Transaction>> call, Response<List<Transaction>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    transactionList = response.body();
                    List<String> displayList = new ArrayList<>();

                    for (Transaction t : transactionList) {
                        displayList.add(t.getDescription() + " - $" + t.getAmount());
                    }

                    transactionAdapter = new ArrayAdapter<>(
                            getActivity(),
                            android.R.layout.simple_list_item_1,
                            displayList
                    );
                    setListAdapter(transactionAdapter);
                } else {
                    Log.e("API", "Failed to load transactions: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<Transaction>> call, Throwable t) {
                Log.e("API", "Network error: " + t.getMessage());
            }
        });
    }

    // performs database query outside GUI thread
//    private class GetTransactionsTask extends AsyncTask<Object, Object, Cursor>
//    {
////        SQLiteConnector sqLiteConnector =
////                new SQLiteConnector(getActivity());
//
//        // open database and return Cursor for all contacts
//        @Override
//        protected Cursor doInBackground(Object... params)
//        {
////            sqLiteConnector.open();
////            return sqLiteConnector.getAllTransactions();
//        }
//
//        // use the Cursor returned from the doInBackground method
//        @Override
//        protected void onPostExecute(Cursor result)
//        {
//            transactionAdapter.changeCursor(result); // set the adapter's Cursor
//            //sqLiteConnector.close();
//        }
//    } // end class GetContactsTask

    // when fragment stops, close Cursor and remove from contactAdapter
//    @Override
//    public void onStop()
//    {
//        Cursor cursor = transactionAdapter.getCursor(); // get current Cursor
//        transactionAdapter.changeCursor(null); // adapter now has no Cursor
//
//        if (cursor != null)
//            cursor.close(); // release the Cursor's resources
//
//        super.onStop();
//    }

    // display this fragment's menu items
    @Override
    public void onCreateOptionsMenu(Menu menu, MenuInflater inflater)
    {
        super.onCreateOptionsMenu(menu, inflater);
        inflater.inflate(R.menu.fragment_transaction_list_menu, menu);
    }

    // handle choice from options menu
    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        int itemId = item.getItemId();
        if(itemId == R.id.action_add) {
            listener.onAddTransaction();
            return true;
        }

        return super.onOptionsItemSelected(item); // call super's method
    }

    // update data set
    public void updateTransactionList()
    {
//        new GetContactsTask().execute((Object[]) null);
        fetchTransactionsFromApi();
    }
} // end class TransactionListFragment
