package com.ecommerce.project.repository;

import com.ecommerce.project.entity.AppRole;
import com.ecommerce.project.entity.Role;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RoleRepository extends CrudRepository<Role, Long> {

    Optional<Role> findByRoleName(AppRole appRole);
}
