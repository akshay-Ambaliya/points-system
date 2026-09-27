package com.example.pointingsystem.repository;

import com.example.pointingsystem.entity.Team;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    @Override
    @EntityGraph(attributePaths = {"leader", "yuvaks"})
    List<Team> findAll();

    @Override
    @EntityGraph(attributePaths = {"leader", "yuvaks"})
    Optional<Team> findById(Long id);
}
