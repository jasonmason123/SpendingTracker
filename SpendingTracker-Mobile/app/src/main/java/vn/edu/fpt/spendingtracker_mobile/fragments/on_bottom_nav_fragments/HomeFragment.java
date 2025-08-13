package vn.edu.fpt.spendingtracker_mobile.fragments.on_bottom_nav_fragments;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Response;
import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.adapter.TransactionAdapter;
import vn.edu.fpt.spendingtracker_mobile.api_connector.HomepageApiConnector;
import vn.edu.fpt.spendingtracker_mobile.api_connector.api_callback.ApiCallback;
import vn.edu.fpt.spendingtracker_mobile.dtos.IncomeExpenseDto;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.fragments.base_fragment.BaseFragment;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class HomeFragment extends BaseFragment {
    public interface HomeFragmentListener
    {
        // called when user selects a contact
        public void onTransactionSelected(long rowID);
    }

    private HomeFragmentListener listener;
    private TextView monthTextView;
    private TextView earningsTextView;
    private TextView expensesTextView;
    private TextView ratioText;
    private LocalDate now = LocalDate.now();
    private HomepageApiConnector apiConnector;
    private TransactionAdapter transactionAdapter;

    private List<Transaction> topTransactions = new ArrayList<Transaction>();

    @Override
    protected boolean shouldShowBottomNavigation() {
        return true;
    }

    @Override
    protected boolean shouldDisplayBackButton() {
        return false;
    }

    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        listener = (HomeFragmentListener) activity;
    }

    // remove ContactListFragmentListener when Fragment detached
    @Override
    public void onDetach()
    {
        super.onDetach();
        listener = null;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        monthTextView = view.findViewById(R.id.monthTextView);
        earningsTextView = view.findViewById(R.id.earningsTextView);
        expensesTextView = view.findViewById(R.id.expensesTextView);
        ratioText = view.findViewById(R.id.ratioText);

        monthTextView.setText(getString(R.string.monthText)
                + now.getMonthValue() + "/" + now.getYear());

        // Initialize apiConnector
        apiConnector = MyApp.getApiConnector(HomepageApiConnector.class);

        RecyclerView recyclerView = view.findViewById(R.id.transactionRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        // set transaction list and listener to adapter
        transactionAdapter = new TransactionAdapter(topTransactions, transactionId -> {
            listener.onTransactionSelected(transactionId);
        });
        recyclerView.setAdapter(transactionAdapter);

        return view;
    }

    @Override
    public void onResume() {
        super.onResume();
        getIncomeExpenseByMonth();
        getThreeRecentTransactions();
    }

    private void getIncomeExpenseByMonth() {
        LocalDate firstDay = now.withDayOfMonth(1);
        LocalDate lastDay = now.withDayOfMonth(now.lengthOfMonth());

        Date dateFrom = Date.from(firstDay.atStartOfDay(ZoneId.systemDefault()).toInstant());
        Date dateTo = Date.from(lastDay.atStartOfDay(ZoneId.systemDefault()).toInstant());

        SimpleDateFormat apiFormat =
                new SimpleDateFormat(AppConstants.ISO_UTC_DATE_FORMAT, Locale.getDefault());

        String from = apiFormat.format(dateFrom);
        String to = apiFormat.format(dateTo);

        Locale locale = new Locale("vi", "VN");
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(locale);

        apiConnector.getIncomeExpenseCustomRange(from, to)
                .enqueue(new ApiCallback<IncomeExpenseDto>(requireContext()) {
            @Override
            public void onResponse(
                Call<IncomeExpenseDto> call,
                Response<IncomeExpenseDto> response
            ) {
                if (response.isSuccessful() && response.body() != null) {
                    BigDecimal income = response.body().getIncome();
                    BigDecimal expense = response.body().getExpense();
                    String incomeText = getString(R.string.earningText)
                            + currencyFormat.format(income);
                    String expenseText = getString(R.string.expenseText)
                            + currencyFormat.format(expense);
                    earningsTextView.setText(incomeText);
                    expensesTextView.setText(expenseText);

                    BigDecimal diff = income.subtract(expense);
                    String ratio = (diff.doubleValue() >= 0 ?
                            getString(R.string.remainingText) :
                            getString(R.string.overspentText)) +
                            currencyFormat.format(diff);

                    ratioText.setText(ratio);
                    ratioText.setTextColor(
                        ContextCompat.getColor(requireContext(),
                            diff.doubleValue() >= 0 ? R.color.green : R.color.red));
                } else {
                    try {
                        Log.e("getIncomeExpenseByMonth",
                                response.code() + ": " + response.errorBody().string());
                    } catch (IOException e) {
                        Log.e("getIncomeExpenseByMonth", "Error parsing errorBody");
                    }
                }
            }

            @Override
            public void onFailure(Call<IncomeExpenseDto> call, Throwable t) {
                super.onFailure(call, t);
            }
        });
    }

    private void getThreeRecentTransactions() {
        int top = 3;
        apiConnector.getTopRecentTransactions(top)
            .enqueue(new ApiCallback<List<Transaction>>(requireContext()) {
                @Override
                public void onResponse(
                        Call<List<Transaction>> call,
                        Response<List<Transaction>> response
                ) {
                    if (response.isSuccessful() && response.body() != null) {
                        topTransactions.clear(); // Clear the old data
                        topTransactions.addAll(response.body()); // Add new data
                        transactionAdapter.notifyDataSetChanged();
                    } else {
                        Log.e("getThreeRecentTransactions", "Failed to load transactions: "
                                + response.code() + ": "
                                + call.request().url());
                    }
                }
            });
    }
}

