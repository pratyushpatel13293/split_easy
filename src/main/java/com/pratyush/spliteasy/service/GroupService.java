package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.*;
import com.pratyush.spliteasy.entity.ExpenseGroup;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.exception.AlreadyMemberException;
import com.pratyush.spliteasy.exception.ResourceNotFoundException;
import com.pratyush.spliteasy.repository.ExpenseGroupRepository;
import com.pratyush.spliteasy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class GroupService {
    private final ExpenseGroupRepository expenseGroupRepository;

    private final UserRepository userRepository;

    public GroupService(ExpenseGroupRepository expenseGroupRepository, UserRepository userRepository) {
        this.expenseGroupRepository = expenseGroupRepository;
        this.userRepository = userRepository;
    }

    public GroupResponse createGroup(CreateGroupRequest request) {
        ExpenseGroup expenseGroup = new ExpenseGroup(request.name());
        ExpenseGroup saved = expenseGroupRepository.save(expenseGroup);
        return new GroupResponse(saved.getId(), saved.getName());
    }

    @Transactional
    public GroupDetailsResponse addMember(Long groupId, AddMemberRequest request) {

        ExpenseGroup group = expenseGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));


        if (group.getMembers().contains(user)) {
            throw new AlreadyMemberException("User " + user.getId() + " is already a member of group " + groupId);
        }


        group.getMembers().add(user);
        expenseGroupRepository.save(group);
        List<UserResponse> members = new ArrayList<>();

        for (User member : group.getMembers()) {


            members.add(new UserResponse(member.getId(), member.getName(), member.getEmail()));
        }
        return new GroupDetailsResponse(group.getId(), group.getName(), members);

    }

}
