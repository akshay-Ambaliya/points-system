package com.example.pointingsystem.repository;

import com.example.pointingsystem.dto.PointsLogResponse;
import com.example.pointingsystem.entity.PointsLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PointsLogRepository extends JpaRepository<PointsLog, Long> {

    @Query("SELECT new com.example.pointingsystem.dto.PointsLogResponse(p.id, p.yuvak.fullName, p.points, p.type, p.reason, p.loggedDate) " +
           "FROM PointsLog p " +
           "WHERE (:type IS NULL OR :type = '' OR LOWER(p.type) = LOWER(:type)) " +
           "AND (:yuvakId IS NULL OR p.yuvak.id = :yuvakId) " +
           "ORDER BY p.loggedDate DESC")
    Page<PointsLogResponse> findAllPointsLogResponse(
            @Param("type") String type,
            @Param("yuvakId") Long yuvakId,
            Pageable pageable
    );

    @Query("SELECT p.yuvak.id, SUM(CASE WHEN LOWER(p.type) = 'increment' THEN p.points WHEN LOWER(p.type) = 'decrement' THEN -p.points ELSE 0 END) " +
           "FROM PointsLog p GROUP BY p.yuvak.id")
    java.util.List<Object[]> findTotalPointsPerYuvak();
}
