package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.CreateExpenseRequest;
import com.pratyush.spliteasy.dto.ExpenseResponse;
import com.pratyush.spliteasy.dto.SplitResponse;
import com.pratyush.spliteasy.entity.Expense;
import com.pratyush.spliteasy.entity.ExpenseGroup;
import com.pratyush.spliteasy.entity.ExpenseSplit;
import com.pratyush.spliteasy.entity.User;

import com.pratyush.spliteasy.exception.InvalidRequestException;
import com.pratyush.spliteasy.exception.ResourceNotFoundException;
import com.pratyush.spliteasy.repository.ExpenseGroupRepository;
import com.pratyush.spliteasy.repository.ExpenseRepository;
import com.pratyush.spliteasy.repository.ExpenseSplitRepository;
import com.pratyush.spliteasy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ExpenseService {
    private final UserRepository userRepository;
    private final ExpenseGroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;

    public ExpenseService(UserRepository userRepository, ExpenseGroupRepository groupRepository, ExpenseRepository expenseRepository, ExpenseSplitRepository expenseSplitRepository) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.expenseSplitRepository = expenseSplitRepository;
    }

    @Transactional
    public ExpenseResponse addExpense(Long groupId, CreateExpenseRequest request) {

        // 1. Find the group, 404 if missing
        ExpenseGroup group = groupRepository.findById(groupId).orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));


        // 2. Find the payer, 404 if missing
        User payer = userRepository.findById(request.paidByUserId()).orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.paidByUserId()));

        // 3. Payer must be a member of the group, 400 if not

        if (!group.getMembers().contains(payer)) {
            throw new InvalidRequestException("User " + payer.getId() + " is not a member of group " + groupId);
        }

        // 4. Get the members of the group

        Set<User> members = group.getMembers();

        // 5a. Count the members
        int count = members.size();
        // 5b. Base share = amount ÷ count, 2 decimal places, rounded DOWN
        BigDecimal baseShare = request.amount().divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN);

        // 5c. Leftover = amount − (baseShare × count)
        BigDecimal leftover = request.amount().subtract(baseShare.multiply(BigDecimal.valueOf(count)));

        // 6a. Create the expense

        Expense expense = new Expense(payer, group, request.amount(), request.description());

        Expense savedExpense = expenseRepository.save(expense);

        // 7a. Empty list to collect each member's split for the response

        List<SplitResponse> splitResponses = new ArrayList<>();
        // 6b. For each member, decide share, save split
        for (User member : members) {

            BigDecimal share;

            if (member.getId().equals(payer.getId())) {
                share = baseShare.add(leftover);

            } else {
                share = baseShare;
            }
            splitResponses.add(new SplitResponse(member.getId(), member.getName(), share));

            ExpenseSplit expenseSplit = new ExpenseSplit(savedExpense, member, share);

            ExpenseSplit savedExpenseSplit = expenseSplitRepository.save(expenseSplit);

        }

        // 7b. Build and return the response
        return new ExpenseResponse( savedExpense.getId(), savedExpense.getDescription(), savedExpense.getAmount(),payer.getId(),savedExpense.getCreatedAt(),splitResponses);
    }

}
