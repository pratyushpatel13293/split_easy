package com.pratyush.spliteasy.controller;

import com.pratyush.spliteasy.dto.SettlementResponse;
import com.pratyush.spliteasy.service.SettlementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping("/groups/{groupId}/settlements")
    public List<SettlementResponse> getSettlements(@PathVariable Long groupId){

        return settlementService.getSettlements(groupId);

    }


}
