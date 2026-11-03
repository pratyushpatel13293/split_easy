package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.GroupDetailsResponse;
import com.pratyush.spliteasy.dto.GroupResponse;
import com.pratyush.spliteasy.dto.UserResponse;
import com.pratyush.spliteasy.entity.ExpenseGroup;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.exception.ResourceNotFoundException;
import com.pratyush.spliteasy.repository.ExpenseGroupRepository;
import com.pratyush.spliteasy.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

// Added with the demo UI: covers the new GET /groups and GET /groups/{id} service methods.
@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private ExpenseGroupRepository expenseGroupRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GroupService groupService;

    @Test
    void getAllGroups_mapsEntitiesToDtos() {
        ExpenseGroup goa = new ExpenseGroup("Goa Trip");
        ReflectionTestUtils.setField(goa, "id", 1L);

        when(expenseGroupRepository.findAll(any(Sort.class))).thenReturn(List.of(goa));

        List<GroupResponse> result = groupService.getAllGroups();

        assertEquals(List.of(new GroupResponse(1L, "Goa Trip")), result);
    }

    @Test
    void getGroup_returnsMembersSortedById() {
        User chetan = new User("Chetan", "chetan@test.com");
        ReflectionTestUtils.setField(chetan, "id", 10L);
        User amit = new User("Amit", "amit@test.com");
        ReflectionTestUtils.setField(amit, "id", 8L);

        ExpenseGroup goa = new ExpenseGroup("Goa Trip");
        ReflectionTestUtils.setField(goa, "id", 1L);
        goa.getMembers().add(chetan);
        goa.getMembers().add(amit);

        when(expenseGroupRepository.findById(1L)).thenReturn(Optional.of(goa));

        GroupDetailsResponse result = groupService.getGroup(1L);

        // members is a HashSet, so the service sorts by id for a stable order
        GroupDetailsResponse expected = new GroupDetailsResponse(1L, "Goa Trip", List.of(
                new UserResponse(8L, "Amit", "amit@test.com"),
                new UserResponse(10L, "Chetan", "chetan@test.com")
        ));
        assertEquals(expected, result);
    }

    @Test
    void getGroup_missingGroup_throwsNotFound() {
        when(expenseGroupRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> groupService.getGroup(99L));
    }
}
