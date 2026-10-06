package com.pratyush.spliteasy.controller;

import com.pratyush.spliteasy.dto.AddMemberRequest;
import com.pratyush.spliteasy.dto.CreateGroupRequest;
import com.pratyush.spliteasy.dto.GroupDetailsResponse;
import com.pratyush.spliteasy.dto.GroupResponse;
import com.pratyush.spliteasy.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
public class GroupController {
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/groups")
    @ResponseStatus(HttpStatus.CREATED)
    public GroupResponse createGroup(@Valid @RequestBody CreateGroupRequest request) {
        return groupService.createGroup(request);

    }

    @PostMapping("/groups/{id}/members")
    public GroupDetailsResponse addMember(@PathVariable Long id, @Valid @RequestBody AddMemberRequest request) {
        return groupService.addMember(id, request);
    }
}
