package com.pratyush.spliteasy.service;

import com.pratyush.spliteasy.dto.CreateUserRequest;
import com.pratyush.spliteasy.dto.UserResponse;
import com.pratyush.spliteasy.entity.User;
import com.pratyush.spliteasy.exception.DuplicateEmailException;
import com.pratyush.spliteasy.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service

public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse createUser(CreateUserRequest request) {
        if ( userRepository.existsByEmail(request.email()) ) {
            throw new DuplicateEmailException( "Email already exists: " + request.email() );
        }
        User user = new User(request.name(), request.email());
        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getName(), saved.getEmail());
    }

    // Added for the demo UI. Sorted by id so the list order is stable.
    public List<UserResponse> getAllUsers() {
        List<UserResponse> result = new ArrayList<>();
        for (User user : userRepository.findAll(Sort.by("id"))) {
            result.add(new UserResponse(user.getId(), user.getName(), user.getEmail()));
        }
        return result;
    }
}
