package vn.edu.fpt.spendingtracker_mobile.fragments.on_bottom_nav_fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;

import vn.edu.fpt.spendingtracker_mobile.MyApp;
import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.api_connector.TransactionApiConnector;
import vn.edu.fpt.spendingtracker_mobile.fragments.BaseFragment;

public class HomeFragment extends BaseFragment {

    private TextView earningsExpensesText;
    private TextView ratioText;
    private TextView recentTransactionsText;
    private TransactionApiConnector apiConnector;

    // Dummy data for now
    private double earnings = 5000;
    private double expenses = 4300;
    private String[] topTransactions = {
            "Starbucks - $5.00",
            "Uber - $12.50",
            "Salary - $3000.00"
    };

    @Override
    protected boolean shouldShowBottomNavigation() {
        return true;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        earningsExpensesText = view.findViewById(R.id.earningsExpensesText);
        ratioText = view.findViewById(R.id.ratioText);
        recentTransactionsText = view.findViewById(R.id.recentTransactionsText);

        // TODO: Get total monthly earnings and expenses

        // Initialize apiConnector
        apiConnector = MyApp.getApiConnector(TransactionApiConnector.class);

        loadHomeData();

        return view;
    }

    private void loadHomeData() {
        earningsExpensesText.setText("Earnings: $" + earnings + "\nExpenses: $" + expenses);

        double diff = earnings - expenses;
        String ratio = diff >= 0 ? "Remaining: $" + diff : "Overspent: $" + (-diff);
        ratioText.setText(ratio);
        ratioText.setTextColor(
                ContextCompat.getColor(requireContext(),
                        diff >= 0 ? R.color.green : R.color.red)
        );

        StringBuilder recent = new StringBuilder("Top 3 Transactions:\n");
        for (String tx : topTransactions) {
            recent.append("- ").append(tx).append("\n");
        }
        recentTransactionsText.setText(recent.toString().trim());
    }
}

