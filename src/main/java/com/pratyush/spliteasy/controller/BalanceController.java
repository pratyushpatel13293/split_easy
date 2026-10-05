    package com.pratyush.spliteasy.controller;


    import com.pratyush.spliteasy.dto.BalanceResponse;
    import com.pratyush.spliteasy.service.BalanceService;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.RestController;

    import java.util.List;

    @RestController
    public class BalanceController {
        private final BalanceService balanceService;

        public BalanceController(BalanceService balanceService){
            this.balanceService = balanceService;
        }
        @GetMapping("/groups/{groupId}/balances")
        public List<BalanceResponse> getBalances(@PathVariable Long groupId) {

            return balanceService.getBalances(groupId);
        }
    }
