// ContactListFragment.java
// Displays the list of contact names
package vn.edu.fpt.spendingtracker_mobile.fragments.on_bottom_nav_fragments;

import android.app.Activity;
import androidx.fragment.app.ListFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.adapter.TransactionAdapter;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.enums.TransactionType;
import vn.edu.fpt.spendingtracker_mobile.fragments.BaseFragment;

public class TransactionListFragment extends BaseFragment
{
    @Override
    protected boolean shouldShowBottomNavigation() {
        return true;
    }

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
    private TransactionAdapter transactionAdapter;
    private ProgressBar loadingSpinner;
    private TextView emptyTextView;

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

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_transaction_list, container, false);
    }

    // called after View is created
    @Override
    public void onViewCreated(View view, Bundle savedInstanceState)
    {
        super.onViewCreated(view, savedInstanceState);
        setRetainInstance(true); // save fragment across config changes
        setHasOptionsMenu(true); // this fragment has menu items to display

        // Initialize API connector
        apiConnector = MyApp.getApiConnector(TransactionApiConnector.class);

        loadingSpinner = view.findViewById(R.id.loadingSpinner);
        emptyTextView = view.findViewById(R.id.emptyTextView);

        RecyclerView recyclerView = view.findViewById(R.id.transactionRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // set transaction list and listener to adapter
        transactionAdapter = new TransactionAdapter(transactionList, transactionId -> {
            listener.onTransactionSelected(transactionId);
        });
        recyclerView.setAdapter(transactionAdapter);
    }

    // when fragment resumes, use a GetContactsTask to load contacts
    @Override
    public void onResume()
    {
        super.onResume();
        fetchTransactionsFromApi();
    }

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

    private void fetchTransactionsFromApi() {
        loadingSpinner.setVisibility(View.VISIBLE);
        apiConnector.getList(1, 10).enqueue(new Callback<List<Transaction>>() {
            @Override
            public void onResponse(Call<List<Transaction>> call, Response<List<Transaction>> response) {
                loadingSpinner.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    transactionList.clear(); // Clear the old data
                    transactionList.addAll(response.body()); // Add new data
                    transactionAdapter.notifyDataSetChanged();
                    if(transactionList.isEmpty()) {
                        emptyTextView.setVisibility(View.VISIBLE);
                    }
                } else {
                    Log.e("API", "Failed to load transactions: "
                            + response.code() + ": "
                            + call.request().url());
                }
            }

            @Override
            public void onFailure(Call<List<Transaction>> call, Throwable t) {
                loadingSpinner.setVisibility(View.GONE);
                Log.e("API", "Network error: " + t.getMessage());
            }
        });
    }

    // update data set
    public void updateTransactionList()
    {
        fetchTransactionsFromApi();
    }
} // end class TransactionListFragment
