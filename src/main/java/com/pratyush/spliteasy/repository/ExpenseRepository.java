package com.pratyush.spliteasy.repository;

import com.pratyush.spliteasy.entity.Expense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense,Long> {

    List<Expense> findByGroup_Id(Long groupId);

    Page<Expense> findByGroup_Id(Long groupId,Pageable pageable);

}
