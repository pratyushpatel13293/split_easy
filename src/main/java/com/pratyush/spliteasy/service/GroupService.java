package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.CreateGroupRequest;
import com.pratyush.spliteasy.dto.GroupResponse;
import com.pratyush.spliteasy.entity.ExpenseGroup;
import com.pratyush.spliteasy.repository.ExpenseGroupRepository;
import org.springframework.stereotype.Service;

@Service
public class GroupService {
    private final ExpenseGroupRepository expenseGroupRepository;

    public GroupService(ExpenseGroupRepository expenseGroupRepository) {
        this.expenseGroupRepository = expenseGroupRepository;
    }

    public GroupResponse createGroup(CreateGroupRequest request){
        ExpenseGroup  expenseGroup = new ExpenseGroup(request.name());
        ExpenseGroup saved = expenseGroupRepository.save(expenseGroup);
        return new GroupResponse(saved.getId(), saved.getName());
    }

}
