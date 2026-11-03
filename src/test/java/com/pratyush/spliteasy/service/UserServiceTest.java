package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.UserResponse;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

// Added with the demo UI: covers the new GET /users service method.
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getAllUsers_mapsEntitiesToDtos() {
        User amit = new User("Amit", "amit@test.com");
        ReflectionTestUtils.setField(amit, "id", 8L);
        User bina = new User("Bina", "bina@test.com");
        ReflectionTestUtils.setField(bina, "id", 9L);

        when(userRepository.findAll(any(Sort.class))).thenReturn(List.of(amit, bina));

        List<UserResponse> result = userService.getAllUsers();

        assertEquals(2, result.size());
        assertEquals(new UserResponse(8L, "Amit", "amit@test.com"), result.get(0));
        assertEquals(new UserResponse(9L, "Bina", "bina@test.com"), result.get(1));
    }

    @Test
    void getAllUsers_emptyDatabase_returnsEmptyList() {
        when(userRepository.findAll(any(Sort.class))).thenReturn(List.of());

        assertEquals(0, userService.getAllUsers().size());
    }
}
