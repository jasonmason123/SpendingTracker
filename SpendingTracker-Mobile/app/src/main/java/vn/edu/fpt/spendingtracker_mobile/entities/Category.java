package vn.edu.fpt.spendingtracker_mobile.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import vn.edu.fpt.spendingtracker_mobile.enums.FlagBoolean;

public class Category {
    private int id;
    private String name;
    private BigDecimal monthlyLimit = BigDecimal.ZERO;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private FlagBoolean flagDel = FlagBoolean.FALSE;

    public Category() {
    }

    public Category(String name) {
        this.name = name;
    }

    // Getters and setters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getMonthlyLimit() {
        return monthlyLimit;
    }
    public void setMonthlyLimit(BigDecimal monthlyLimit) {
        this.monthlyLimit = monthlyLimit;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public FlagBoolean getFlagDel() {
        return flagDel;
    }
    public void setFlagDel(FlagBoolean flagDel) {
        this.flagDel = flagDel;
    }
}

