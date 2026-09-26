package com.pratyush.spliteasy.repository;

import com.pratyush.spliteasy.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense,Long> {
}
