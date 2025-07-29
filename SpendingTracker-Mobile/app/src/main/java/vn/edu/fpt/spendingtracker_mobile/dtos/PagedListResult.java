package vn.edu.fpt.spendingtracker_mobile.dtos;

import java.math.BigDecimal;
import java.util.List;

public class PagedListResult<TItemType> {
    public BigDecimal totalBudget;
    public int totalItemCount;
    public int pageCount;
    public int pageSize;
    public int pageNumber;
    public List<TItemType> items;

    public PagedListResult(BigDecimal totalBudget, int totalItemCount, int pageCount, int pageSize, int pageNumber, List<TItemType> items) {
        this.totalBudget = totalBudget;
        this.totalItemCount = totalItemCount;
        this.pageCount = pageCount;
        this.pageSize = pageSize;
        this.pageNumber = pageNumber;
        this.items = items;
    }

    public PagedListResult(int totalItemCount, int pageCount, int pageSize, int pageNumber, List<TItemType> items) {
        this.totalItemCount = totalItemCount;
        this.pageCount = pageCount;
        this.pageSize = pageSize;
        this.pageNumber = pageNumber;
        this.items = items;
    }
}
