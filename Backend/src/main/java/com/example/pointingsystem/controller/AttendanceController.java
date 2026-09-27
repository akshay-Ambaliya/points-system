package com.example.pointingsystem.controller;

import com.example.pointingsystem.dto.ApiResponse;
import com.example.pointingsystem.dto.AttendanceLogUpdateRequest;
import com.example.pointingsystem.dto.YuvakAttendanceStatusResponse;
import com.example.pointingsystem.entity.AttendanceLog;
import com.example.pointingsystem.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Returns Yuvak list with Present/Absent status for the given date (default today)
    @GetMapping("/yuvaks")
    public ResponseEntity<ApiResponse<List<YuvakAttendanceStatusResponse>>> getYuvaksAttendanceStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<YuvakAttendanceStatusResponse> statusList = attendanceService.getYuvakAttendanceStatus(date);
        ApiResponse<List<YuvakAttendanceStatusResponse>> response = ApiResponse.success("Yuvaks attendance status fetched successfully", statusList);
        return ResponseEntity.ok(response);
    }

    // Update Attendance Log API (finds or creates log based on yuvakId and attendanceDate)
    @PutMapping
    public ResponseEntity<ApiResponse<AttendanceLog>> updateAttendanceLog(
            @RequestBody AttendanceLogUpdateRequest request) {
        AttendanceLog updatedLog = attendanceService.updateAttendanceLog(request);
        ApiResponse<AttendanceLog> response = ApiResponse.success("Attendance log updated successfully", updatedLog);
        return ResponseEntity.ok(response);
    }
}
