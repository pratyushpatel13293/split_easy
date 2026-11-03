package com.pratyush.spliteasy.controller;

import com.pratyush.spliteasy.dto.AddMemberRequest;
import com.pratyush.spliteasy.dto.CreateGroupRequest;
import com.pratyush.spliteasy.dto.GroupDetailsResponse;
import com.pratyush.spliteasy.dto.GroupResponse;
import com.pratyush.spliteasy.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // Added for the demo UI: list all groups (id + name).
    @GetMapping("/groups")
    public List<GroupResponse> getAllGroups() {
        return groupService.getAllGroups();
    }

    // Added for the demo UI: one group with its members. 404 if missing.
    @GetMapping("/groups/{id}")
    public GroupDetailsResponse getGroup(@PathVariable Long id) {
        return groupService.getGroup(id);
    }
}
