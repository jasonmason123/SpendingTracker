package vn.edu.fpt.spendingtracker_mobile.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

import vn.edu.fpt.spendingtracker_mobile.R;
import vn.edu.fpt.spendingtracker_mobile.entities.Transaction;
import vn.edu.fpt.spendingtracker_mobile.enums.TransactionType;
import vn.edu.fpt.spendingtracker_mobile.utils.AppConstants;

public class TransactionAdapter extends RecyclerView.Adapter<TransactionAdapter.ViewHolder> {
    public interface OnItemClickListener {
        void onItemClick(long transactionId);
    }

    private List<Transaction> transactionList;
    private OnItemClickListener listener;

    public TransactionAdapter(List<Transaction> transactionList, OnItemClickListener listener) {
        this.transactionList = transactionList;
        this.listener = listener;
    }

    public static class ViewHolder extends RecyclerView.ViewHolder {
        TextView title, date, amount;

        public ViewHolder(View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.transactionTitle);
            date = itemView.findViewById(R.id.transactionDate);
            amount = itemView.findViewById(R.id.transactionAmount);
        }

        public void bind(final long transactionId, final OnItemClickListener listener) {
            itemView.setOnClickListener(v -> listener.onItemClick(transactionId));
        }
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_transaction, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        Transaction t = transactionList.get(position);
        holder.title.setText(t.getDescription());
        holder.date.setText(AppConstants.simpleDateFormat.format(t.getDate()));
        holder.amount.setText(
                (t.getTransactionType() == TransactionType.EXPENSE ?
                        "-" + String.valueOf(t.getAmount()) :
                        "+" + String.valueOf(t.getAmount()))
                        + " VNĐ");

        // Set color for amount text view
        int color = ContextCompat.getColor(holder.itemView.getContext(),
                t.getTransactionType() == TransactionType.EXPENSE ? R.color.red : R.color.green);
        holder.amount.setTextColor(color);

        holder.bind(t.getId(), listener);
    }

    @Override
    public int getItemCount() {
        return transactionList.size();
    }
}

