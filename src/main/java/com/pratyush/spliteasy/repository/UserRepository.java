package com.pratyush.spliteasy.repository;

import com.pratyush.spliteasy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {


    boolean existsByEmail(String email);
}
