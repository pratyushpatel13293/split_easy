package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.BalanceResponse;
import com.pratyush.spliteasy.dto.SettlementResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
    class SettlementServiceTest {

        @Mock
        private BalanceService balanceService;      // the fake

        @InjectMocks
        private SettlementService settlementService; // real class, fake injected

    // Goa Trip: Amit +170 | Chetan -130, Bina -40  (sums to 0)
    // Expected: Chetan->Amit 130 (largest debtor first), then Bina->Amit 40.
    // No tie here, so exact order and amounts are asserted.
        @Test
      public void goaTrip_producesTwoPayments() {
            when(balanceService.getBalances(1L)).thenReturn(List.of(
                    new BalanceResponse(8L, "Amit", new BigDecimal("170.00")),
                    new BalanceResponse(9L, "Bina", new BigDecimal("-40.00")),
                    new BalanceResponse(10L, "Chetan", new BigDecimal("-130.00"))
            ));
            List<SettlementResponse> result = settlementService.getSettlements(1L);
            assertEquals(2, result.size());
            assertEquals(new SettlementResponse(10L, 8L, new BigDecimal("130.00")), result.get(0));
            assertEquals(new SettlementResponse(9L, 8L, new BigDecimal("40.00")), result.get(1));

        }
        // Greedy: 4 payments. Optimal: 3 (Chetan->Bina 5, Rahul->Amit 3, Mohan->Amit 3).
        // Greedy pairs Chetan(5) with Amit(6, largest) instead of Bina(5, exact match).
        // Only count is asserted: Rahul/Mohan tie at 3 and PriorityQueue order is arbitrary.
    @Test
    public void greedyIsNotAlwaysOptimal() {
        when(balanceService.getBalances(1L)).thenReturn(List.of(
                new BalanceResponse(8L, "Amit", new BigDecimal("6.00")),
                new BalanceResponse(9L, "Bina", new BigDecimal("5.00")),
                new BalanceResponse(10L, "Chetan", new BigDecimal("-5.00")),
                new BalanceResponse(11L, "Rahul", new BigDecimal("-3.00")),
                new BalanceResponse(12L, "Mohan", new BigDecimal("-3.00"))
        ));
        List<SettlementResponse> result = settlementService.getSettlements(1L);
        assertEquals(4, result.size());


    }

    }
