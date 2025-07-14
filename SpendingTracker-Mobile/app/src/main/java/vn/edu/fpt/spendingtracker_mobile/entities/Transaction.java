package vn.edu.fpt.spendingtracker_mobile.entities;

import java.util.Date;

import vn.edu.fpt.spendingtracker_mobile.enums.TransactionTypes;

public class Transaction {
    private int id;
    private String description;
    private String merchant;
    private Date date;
    private double amount;
    private TransactionTypes transactionType;
    private Date createdAt;
    private Date updatedAt;

    public Transaction() {

    }

    public Transaction(String description, String merchant, Date date, double amount, TransactionTypes transactionType) {
        this.description = description;
        this.merchant = merchant;
        this.date = date;
        this.amount = amount;
        this.transactionType = transactionType;
    }

    public Transaction(int id, String description, String merchant, Date date, double amount, TransactionTypes transactionType) {
        this.id = id;
        this.description = description;
        this.merchant = merchant;
        this.date = date;
        this.amount = amount;
        this.transactionType = transactionType;
    }

    public int getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public String getMerchant() {
        return merchant;
    }

    public Date getDate() {
        return date;
    }

    public double getAmount() {
        return amount;
    }

    public TransactionTypes getTransactionType() {
        return transactionType;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}
