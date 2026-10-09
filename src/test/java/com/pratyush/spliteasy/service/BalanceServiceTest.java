package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.BalanceResponse;
import com.pratyush.spliteasy.entity.Expense;
import com.pratyush.spliteasy.entity.ExpenseGroup;
import com.pratyush.spliteasy.entity.ExpenseSplit;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.repository.ExpenseGroupRepository;
import com.pratyush.spliteasy.repository.ExpenseRepository;
import com.pratyush.spliteasy.repository.ExpenseSplitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BalanceServiceTest {

    @Mock
    private ExpenseGroupRepository expenseGroupRepository;      // the fake

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ExpenseSplitRepository expenseSplitRepository;

    @InjectMocks
    private BalanceService balanceService; // real class, fake injected

    @Test
    public void balances_sumToZero(){
        User amit = new User("Amit", "amit@test.com");
        ReflectionTestUtils.setField(amit, "id", 8L);
        User bina = new User("Bina", "bina@test.com");
        ReflectionTestUtils.setField(bina, "id", 9L);
        User chetan = new User("Chetan", "chetan@test.com");
        ReflectionTestUtils.setField(chetan, "id", 10L);

        ExpenseGroup group = new ExpenseGroup("Goa Trip");
        group.getMembers().add(amit);
        group.getMembers().add(bina);
        group.getMembers().add(chetan);

        when(expenseGroupRepository.findById(1L)).thenReturn(Optional.of(group));

        Expense dinner = new Expense(amit, group, new BigDecimal("100.00"), "Dinner");
        when(expenseRepository.findByGroup_Id(1L)).thenReturn(List.of(dinner));

        ExpenseSplit amitShare = new ExpenseSplit(dinner, amit, new BigDecimal("33.34"));
        ExpenseSplit binaShare = new ExpenseSplit(dinner, bina, new BigDecimal("33.33"));
        ExpenseSplit chetanShare = new ExpenseSplit(dinner, chetan, new BigDecimal("33.33"));

        when(expenseSplitRepository.findByExpense_Group_Id(1L)).thenReturn(List.of(amitShare, binaShare, chetanShare));

        List<BalanceResponse> result = balanceService.getBalances(1L);

        BigDecimal sum = BigDecimal.ZERO;
        for (BalanceResponse b : result) {
            sum = sum.add(b.balance());
        }
        assertEquals(0, sum.compareTo(BigDecimal.ZERO));
    }
}
