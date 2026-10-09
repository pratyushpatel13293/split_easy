package com.pratyush.spliteasy.controller;

import com.pratyush.spliteasy.dto.CreateExpenseRequest;
import com.pratyush.spliteasy.dto.ExpenseResponse;
import com.pratyush.spliteasy.dto.ExpenseSummaryResponse;
import com.pratyush.spliteasy.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping("/groups/{groupId}/expenses")
    public ExpenseResponse addExpense(@PathVariable Long groupId, @Valid @RequestBody CreateExpenseRequest request) {
        return expenseService.addExpense(groupId, request);
    }

    @GetMapping("/groups/{groupId}/expenses")
    public Page<ExpenseSummaryResponse> getExpenses(@PathVariable Long groupId, @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        return expenseService.getExpenses(groupId,page,size );

    }

}
