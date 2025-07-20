package vn.edu.fpt.spendingtracker_mobile.entities;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Objects;

import vn.edu.fpt.spendingtracker_mobile.enums.TransactionType;

public class Transaction {
    private int id;
    private String description;
    private String merchant;
    private Date date;
    private BigDecimal amount;
    private TransactionType transactionType;
    private Date createdAt;
    private Date updatedAt;

    public Transaction() {

    }

    public Transaction(String description, String merchant, Date date, BigDecimal amount, TransactionType transactionType) {
        this.description = description;
        this.merchant = merchant;
        this.date = date;
        this.amount = amount;
        this.transactionType = transactionType;
    }

    public Transaction(int id, String description, String merchant, Date date, BigDecimal amount, TransactionType transactionType) {
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

    public BigDecimal getAmount() {
        return amount;
    }

    public TransactionType getTransactionType() {
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

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Transaction that = (Transaction) o;
        return id == that.id; // compare by unique identifier
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
