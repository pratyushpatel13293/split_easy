package com.pratyush.spliteasy.repository;

import com.pratyush.spliteasy.entity.ExpenseGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseGroupRepository extends JpaRepository<ExpenseGroup,Long> {
}
