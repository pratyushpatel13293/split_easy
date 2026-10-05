package com.pratyush.spliteasy.repository;

import com.pratyush.spliteasy.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, Long> {

    List<ExpenseSplit> findByExpense_Group_Id(Long groupId);
}