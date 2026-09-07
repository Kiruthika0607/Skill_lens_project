package com.skilllens.repository;

import com.skilllens.entity.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    List<AdminLog> findTop20ByOrderByCreatedAtDesc();
    Page<AdminLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
