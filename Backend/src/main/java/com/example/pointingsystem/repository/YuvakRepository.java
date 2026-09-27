package com.example.pointingsystem.repository;

import com.example.pointingsystem.dto.YuvakIdName;
import com.example.pointingsystem.entity.Yuvak;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface YuvakRepository extends JpaRepository<Yuvak, Long> {

    @Query("SELECT y FROM Yuvak y WHERE (y.active IS NULL OR y.active = true) ORDER BY y.fullName ASC")
    List<Yuvak> findAllActive();

    @Query("SELECT new com.example.pointingsystem.dto.YuvakIdName(y.id, y.fullName) FROM Yuvak y WHERE (y.active IS NULL OR y.active = true) ORDER BY y.fullName")
    List<YuvakIdName> findAllIdAndName();

    @Query("SELECT y FROM Yuvak y " +
           "WHERE (y.active IS NULL OR y.active = true) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(y.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(y.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(y.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(y.address) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY y.createdAt DESC")
    Page<Yuvak> searchAllYuvaks(@Param("search") String search, Pageable pageable);

    @Query("SELECT y FROM Yuvak y " +
           "WHERE y.active = false AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(y.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(y.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(y.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(y.address) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY y.createdAt DESC")
    Page<Yuvak> searchInactiveYuvaks(@Param("search") String search, Pageable pageable);
}
