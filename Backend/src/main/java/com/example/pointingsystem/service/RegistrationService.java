package com.example.pointingsystem.service;

import com.example.pointingsystem.dto.YuvakRegistrationRequest;
import com.example.pointingsystem.entity.Yuvak;
import com.example.pointingsystem.repository.YuvakRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.pointingsystem.entity.PointsLog;
import com.example.pointingsystem.repository.PointsLogRepository;
import java.time.Instant;

@Service
public class RegistrationService {

    private final YuvakRepository yuvakRepository;
    private final PointsLogRepository pointsLogRepository;

    public RegistrationService(YuvakRepository yuvakRepository, PointsLogRepository pointsLogRepository) {
        this.yuvakRepository = yuvakRepository;
        this.pointsLogRepository = pointsLogRepository;
    }

    @Transactional
    public Yuvak registerYuvak(YuvakRegistrationRequest request) {
        Yuvak yuvak = new Yuvak();
        yuvak.setFullName(request.getFullName());
        yuvak.setPhone(request.getPhone());
        yuvak.setEmail(request.getEmail());
        yuvak.setAddress(request.getAddress());
        yuvak.setRemarks(request.getRemarks());

        Yuvak savedYuvak = yuvakRepository.save(yuvak);

        // Auto Log Points: <Yuvak Name> Registered (+100)
        PointsLog pointsLog = new PointsLog();
        pointsLog.setYuvak(savedYuvak);
        pointsLog.setType("increment");
        pointsLog.setPoints(100);
        pointsLog.setReason(savedYuvak.getFullName() + " Registered");
        pointsLog.setLoggedDate(Instant.now());
        pointsLogRepository.save(pointsLog);

        populateYuvakPoints(Collections.singletonList(savedYuvak));
        return savedYuvak;
    }

    @Transactional
    public Yuvak updateYuvak(Long id, YuvakRegistrationRequest request) {
        Yuvak yuvak = yuvakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yuvak not found with id: " + id));

        yuvak.setFullName(request.getFullName());
        yuvak.setPhone(request.getPhone());
        yuvak.setEmail(request.getEmail());
        yuvak.setAddress(request.getAddress());
        yuvak.setRemarks(request.getRemarks());

        Yuvak savedYuvak = yuvakRepository.save(yuvak);
        populateYuvakPoints(Collections.singletonList(savedYuvak));
        return savedYuvak;
    }

    @Transactional
    public Yuvak inactivateYuvak(Long id) {
        Yuvak yuvak = yuvakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yuvak not found with id: " + id));

        yuvak.setActive(false);
        Yuvak savedYuvak = yuvakRepository.save(yuvak);
        populateYuvakPoints(Collections.singletonList(savedYuvak));
        return savedYuvak;
    }

    @Transactional
    public Yuvak reactivateYuvak(Long id) {
        Yuvak yuvak = yuvakRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yuvak not found with id: " + id));

        yuvak.setActive(true);
        Yuvak savedYuvak = yuvakRepository.save(yuvak);
        populateYuvakPoints(Collections.singletonList(savedYuvak));
        return savedYuvak;
    }

    public Page<Yuvak> getAllYuvaks(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Yuvak> yuvakPage = yuvakRepository.searchAllYuvaks(search, pageable);
        populateYuvakPoints(yuvakPage.getContent());
        return yuvakPage;
    }

    public Page<Yuvak> getInactiveYuvaks(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Yuvak> yuvakPage = yuvakRepository.searchInactiveYuvaks(search, pageable);
        populateYuvakPoints(yuvakPage.getContent());
        return yuvakPage;
    }

    public List<Yuvak> getAllYuvaksList() {
        List<Yuvak> yuvaks = yuvakRepository.findAll(Sort.by("fullName").ascending());
        populateYuvakPoints(yuvaks);
        return yuvaks;
    }

    private void populateYuvakPoints(List<Yuvak> yuvaks) {
        if (yuvaks == null || yuvaks.isEmpty()) {
            return;
        }

        Map<Long, Integer> yuvakPointsMap = new HashMap<>();
        for (Object[] row : pointsLogRepository.findTotalPointsPerYuvak()) {
            Long yuvakId = (Long) row[0];
            Long totalPoints = (Long) row[1];
            if (yuvakId != null && totalPoints != null) {
                yuvakPointsMap.put(yuvakId, totalPoints.intValue());
            }
        }

        for (Yuvak yuvak : yuvaks) {
            yuvak.setPoints(yuvakPointsMap.getOrDefault(yuvak.getId(), 0));
        }
    }
}
