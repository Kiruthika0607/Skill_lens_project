package com.skilllens.career;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import java.util.*;
public interface CareerRoleRepository extends JpaRepository<CareerRole, Long> {
    Page<CareerRole> findByActiveTrue(Pageable p);
    List<CareerRole> findByActiveTrueAndIndustryIgnoreCase(String industry);
    Optional<CareerRole> findByTitleIgnoreCase(String title);
}
