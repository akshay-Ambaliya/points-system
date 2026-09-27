package com.example.pointingsystem.repository;

import com.example.pointingsystem.entity.AttendanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, Long> {
    List<AttendanceLog> findByAttendanceDate(LocalDate attendanceDate);
    Optional<AttendanceLog> findByYuvakIdAndAttendanceDate(Long yuvakId, LocalDate attendanceDate);
}
