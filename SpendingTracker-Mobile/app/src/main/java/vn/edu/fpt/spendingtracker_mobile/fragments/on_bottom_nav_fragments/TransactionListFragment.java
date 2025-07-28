// ContactListFragment.java
// Displays the list of contact names
package vn.edu.fpt.spendingtracker_mobile.fragments.on_bottom_nav_fragments;

import android.app.Activity;

import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Response;
import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.adapter.TransactionAdapter;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.api_callback.ApiCallback;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.fragments.base_fragment.BaseFragment;

public class TransactionListFragment extends BaseFragment
{
    @Override
    protected boolean shouldShowBottomNavigation() {
        return true;
    }

    @Override
    protected boolean shouldDisplayBackButton() {
        return false;
    }

    // callback methods implemented by MainActivity
    public interface TransactionListFragmentListener
    {
        // called when user selects a contact
        public void onTransactionSelected(long transactionId);

        // called when user decides to add a contact
        public void onAddTransaction();
    }

    private TransactionListFragmentListener listener;
    private List<Transaction> transactionList = new ArrayList<>();
    private Set<Integer> existingIds = new HashSet<>();
    private TransactionAdapter transactionAdapter;
    private ProgressBar loadingSpinner;
    private TextView emptyTextView;
    private EditText searchEditText;
    private TextView noNewTransactionYetTextView;
    private Button loadMoreButton;
    private String searchString;
    private int pageNumber = 1;
    private boolean isLoading;
    private final int PAGE_SIZE = 10;

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
        searchEditText = view.findViewById(R.id.searchEditText);
        noNewTransactionYetTextView = view.findViewById(R.id.noMoreYetTextView);
        loadMoreButton = view.findViewById(R.id.loadMoreButton);

        searchEditText.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                String searchText = searchEditText.getText().toString().trim();
                searchString = searchText;

                fetchTransactionsFromApi(searchString, true);

                // Hide keyboard
                InputMethodManager imm = (InputMethodManager) requireContext()
                                            .getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(searchEditText.getWindowToken(), 0);
                return true;
            }
            return false;
        });

        RecyclerView recyclerView = view.findViewById(R.id.transactionRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // set transaction list and listener to adapter
        transactionAdapter = new TransactionAdapter(transactionList, transactionId -> {
            listener.onTransactionSelected(transactionId);
        });
        recyclerView.setAdapter(transactionAdapter);

        loadMoreButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!isLoading) {
                    // Load more data here
                    fetchTransactionsFromApi(searchString, false);
                }
            }
        });
    }

    // when fragment resumes, use a GetContactsTask to load contacts
    @Override
    public void onResume()
    {
        super.onResume();
        fetchTransactionsFromApi(searchString, true);
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

    private void fetchTransactionsFromApi(String searchString, boolean replaceOldData) {
        isLoading = true;
        loadingSpinner.setVisibility(View.VISIBLE);
        loadMoreButton.setEnabled(false);

        // Reset pageNumber to 1 when replacing old data
        if(replaceOldData && pageNumber != 1)
            pageNumber = 1;

        apiConnector.getPagedList(searchString, pageNumber, PAGE_SIZE)
            .enqueue(new ApiCallback<List<Transaction>>(requireContext()) {
                @Override
                public void onResponse(
                        Call<List<Transaction>> call,
                        Response<List<Transaction>> response
                ) {
                    Log.i("fetchTransactionsFromApi", "fetching page: " + pageNumber);
                    loadingSpinner.setVisibility(View.GONE);

                    if (response.isSuccessful() && response.body() != null) {
                        List<Transaction> newData = response.body();

                        if (replaceOldData) {
                            transactionList.clear(); // Clear the old data
                            existingIds.clear();
                        }

                        if (transactionList.isEmpty() && newData.isEmpty()) {
                            emptyTextView.setVisibility(View.VISIBLE);
                        } else {
                            boolean hasNewData = false;

                            for (Transaction t : newData) {
                                if (!existingIds.contains(t.getId())) {
                                    transactionList.add(t);
                                    existingIds.add(t.getId());
                                    hasNewData = true;
                                }
                            }
                            emptyTextView.setVisibility(View.GONE);
                            transactionAdapter.notifyDataSetChanged();

                            // Only increment pageNumber if server returns the list whose number of items matches the page size
                            if (newData.size() == PAGE_SIZE) {
                                pageNumber += 1;
                            }

                            // Toggle no new data yet message
                            if(!hasNewData) {
                                noNewTransactionYetTextView.setVisibility(View.VISIBLE);

                                // Hide after 3 seconds
                                noNewTransactionYetTextView.postDelayed(() -> {
                                    noNewTransactionYetTextView.setVisibility(View.GONE);
                                }, 3000); // 3000 milliseconds = 3 seconds
                            }
                        }
                    } else {
                        Log.e("API", "Failed to load transactions: "
                                + response.code() + ": "
                                + call.request().url());
                    }

                    isLoading = false;
                    loadMoreButton.setEnabled(true);
                }

                @Override
                public void onFailure(Call<List<Transaction>> call, Throwable t) {
                    super.onFailure(call, t);
                    loadingSpinner.setVisibility(View.GONE);
                    isLoading = false;
                    emptyTextView.setVisibility(View.VISIBLE);
                }
            });
    }

    // update data set
    public void updateTransactionList()
    {
        // Remove search string before refreshing data
        if(searchString != null) {
            searchString = null;
            searchEditText.setText(null);
        }
        fetchTransactionsFromApi(null, true);
    }
} // end class TransactionListFragment
