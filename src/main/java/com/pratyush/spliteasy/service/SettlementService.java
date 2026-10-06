package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.BalanceResponse;
import com.pratyush.spliteasy.dto.SettlementResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

@Service
public class SettlementService {
    private final BalanceService balanceService;

    public SettlementService(BalanceService balanceService) {
        this.balanceService = balanceService;
    }

    private record PersonAmount(Long userId, BigDecimal amount) {}

  public  List<SettlementResponse> getSettlements(Long groupId) {
        List<BalanceResponse> balances = balanceService.getBalances(groupId);

      PriorityQueue<PersonAmount> creditors =
              new PriorityQueue<>(Comparator.comparing(PersonAmount::amount).reversed());

      PriorityQueue<PersonAmount> debtors =
              new PriorityQueue<>(Comparator.comparing(PersonAmount::amount).reversed());

      for (BalanceResponse b : balances) {
          if (b.balance().signum() > 0) {
              creditors.offer(new PersonAmount(b.userId(), b.balance()));
          } else if (b.balance().signum() < 0) {
              debtors.offer(new PersonAmount(b.userId(), b.balance().negate()));
          }
      }
      List<SettlementResponse> result = new ArrayList<>();
      while(!debtors.isEmpty() && !creditors.isEmpty()){
          PersonAmount debtor = debtors.poll();
          PersonAmount creditor = creditors.poll();
          BigDecimal pay = debtor.amount().min(creditor.amount());

          result.add(new SettlementResponse(debtor.userId(), creditor.userId(), pay));

          BigDecimal creditorLeft = creditor.amount().subtract(pay);

          if (creditorLeft.signum() > 0) {
              creditors.offer(new PersonAmount(creditor.userId(), creditorLeft));
          }

          BigDecimal debtorLeft = debtor.amount().subtract(pay);

          if (debtorLeft.signum() > 0) {
              debtors.offer(new PersonAmount(debtor.userId(), debtorLeft));
          }
      }

        return result;
    }



}
