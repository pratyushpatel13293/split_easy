package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.CreateUserRequest;
import com.pratyush.spliteasy.dto.UserResponse;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service

public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse createUser(CreateUserRequest request) {
        User user = new User(request.name(), request.email());
        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getName(), saved.getEmail());
    }
}
