package com.example.pointingsystem.controller;

import com.example.pointingsystem.dto.ApiResponse;
import com.example.pointingsystem.dto.PointsLogRequest;
import com.example.pointingsystem.dto.PointsLogResponse;
import com.example.pointingsystem.entity.PointsLog;
import com.example.pointingsystem.service.PointsService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/points")
@CrossOrigin(origins = "*")
public class PointsController {

    private final PointsService pointsService;

    public PointsController(PointsService pointsService) {
        this.pointsService = pointsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PointsLogResponse>>> getAllPointsLogs(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long yuvakId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PointsLogResponse> pointsLogs = pointsService.getAllPointsLogs(type, yuvakId, page, size);
        ApiResponse<Page<PointsLogResponse>> response = ApiResponse.success("Points logs fetched successfully", pointsLogs);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PointsLog>> addPointsLog(@RequestBody PointsLogRequest request) {
        PointsLog savedLog = pointsService.addPointsLog(request);
        ApiResponse<PointsLog> response = ApiResponse.success("Points log added successfully", savedLog);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
