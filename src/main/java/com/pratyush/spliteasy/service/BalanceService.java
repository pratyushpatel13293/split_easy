package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.BalanceResponse;
import com.pratyush.spliteasy.entity.Expense;
import com.pratyush.spliteasy.entity.ExpenseGroup;
import com.pratyush.spliteasy.entity.ExpenseSplit;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.exception.ResourceNotFoundException;
import com.pratyush.spliteasy.repository.ExpenseGroupRepository;
import com.pratyush.spliteasy.repository.ExpenseRepository;
import com.pratyush.spliteasy.repository.ExpenseSplitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;


@Service
public class BalanceService {
    private final ExpenseGroupRepository expenseGroupRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;

    public BalanceService(ExpenseGroupRepository expenseGroupRepository, ExpenseRepository expenseRepository, ExpenseSplitRepository expenseSplitRepository) {
        this.expenseGroupRepository = expenseGroupRepository;
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
    }

    @Transactional(readOnly = true)
    public List<BalanceResponse> getBalances(Long groupId){
        ExpenseGroup group = expenseGroupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));

        Map<Long, BigDecimal> balances = new HashMap<>();

        for(User member: group.getMembers()){
            balances.put(member.getId(),BigDecimal.ZERO);

        }

        List<Expense> expenses = expenseRepository.findByGroup_Id(groupId);

        for (Expense expense : expenses) {
            Long payerId =expense.getPaidBy().getId();
            balances.put(payerId, balances.get(payerId).add(expense.getAmount()));
        }

        List<ExpenseSplit> splits = expenseSplitRepository.findByExpense_Group_Id(groupId);

        for (ExpenseSplit split : splits) {
            Long userId = split.getUser().getId();
            balances.put(userId, balances.get(userId).subtract(split.getShareAmount()));
        }
        List<BalanceResponse> result = new ArrayList<>();
        for(User member : group.getMembers()){
            result.add(new BalanceResponse(member.getId(),member.getName(), balances.get(member.getId())));
        }
        return result;

    }


}
