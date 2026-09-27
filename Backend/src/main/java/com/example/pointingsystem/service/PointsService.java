package com.example.pointingsystem.service;

import com.example.pointingsystem.dto.PointsLogRequest;
import com.example.pointingsystem.dto.PointsLogResponse;
import com.example.pointingsystem.entity.PointsLog;
import com.example.pointingsystem.entity.Yuvak;
import com.example.pointingsystem.repository.PointsLogRepository;
import com.example.pointingsystem.repository.YuvakRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PointsService {

    private final PointsLogRepository pointsLogRepository;
    private final YuvakRepository yuvakRepository;

    public PointsService(PointsLogRepository pointsLogRepository, YuvakRepository yuvakRepository) {
        this.pointsLogRepository = pointsLogRepository;
        this.yuvakRepository = yuvakRepository;
    }

    public Page<PointsLogResponse> getAllPointsLogs(String type, Long yuvakId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("loggedDate").descending());
        return pointsLogRepository.findAllPointsLogResponse(type, yuvakId, pageable);
    }

    @Transactional
    public PointsLog addPointsLog(PointsLogRequest request) {
        if (request.getYuvakId() == null) {
            throw new IllegalArgumentException("yuvakId is required");
        }
        Yuvak yuvak = yuvakRepository.findById(request.getYuvakId())
                .orElseThrow(() -> new RuntimeException("Yuvak not found with id: " + request.getYuvakId()));

        PointsLog pointsLog = new PointsLog();
        pointsLog.setYuvak(yuvak);
        pointsLog.setType(request.getType());
        pointsLog.setPoints(request.getPoints());
        pointsLog.setReason(request.getReason());
        pointsLog.setLoggedDate(Instant.now());

        return pointsLogRepository.save(pointsLog);
    }
}
