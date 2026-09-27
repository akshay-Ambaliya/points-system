package com.example.pointingsystem.service;

import com.example.pointingsystem.dto.AttendanceLogUpdateRequest;
import com.example.pointingsystem.dto.YuvakAttendanceStatusResponse;
import com.example.pointingsystem.entity.AttendanceLog;
import com.example.pointingsystem.entity.Yuvak;
import com.example.pointingsystem.repository.AttendanceLogRepository;
import com.example.pointingsystem.repository.YuvakRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.example.pointingsystem.entity.PointsLog;
import com.example.pointingsystem.repository.PointsLogRepository;
import java.time.Instant;

@Service
public class AttendanceService {

    private final YuvakRepository yuvakRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final PointsLogRepository pointsLogRepository;

    public AttendanceService(YuvakRepository yuvakRepository,
                             AttendanceLogRepository attendanceLogRepository,
                             PointsLogRepository pointsLogRepository) {
        this.yuvakRepository = yuvakRepository;
        this.attendanceLogRepository = attendanceLogRepository;
        this.pointsLogRepository = pointsLogRepository;
    }

    @Transactional(readOnly = true)
    public List<YuvakAttendanceStatusResponse> getYuvakAttendanceStatus(LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();

        List<Yuvak> allYuvaks = yuvakRepository.findAllActive();
        List<AttendanceLog> logsForDate = attendanceLogRepository.findByAttendanceDate(queryDate);

        Map<Long, AttendanceLog> logMap = logsForDate.stream()
                .filter(log -> log.getYuvak() != null && log.getYuvak().getId() != null)
                .collect(Collectors.toMap(
                        log -> log.getYuvak().getId(),
                        Function.identity(),
                        (existing, replacement) -> replacement
                ));

        return allYuvaks.stream().map(yuvak -> {
            AttendanceLog log = logMap.get(yuvak.getId());
            Boolean present = log != null ? log.getPresent() : false;
            Boolean uniform = log != null ? log.getUniform() : null;
            Boolean carryingDiary = log != null ? log.getCarryingDiary() : null;
            Long logId = log != null ? log.getId() : null;

            return new YuvakAttendanceStatusResponse(
                    yuvak.getId(),
                    yuvak.getFullName(),
                    present,
                    uniform,
                    carryingDiary,
                    logId
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceLog updateAttendanceLog(AttendanceLogUpdateRequest request) {
        if (request.getYuvakId() == null) {
            throw new IllegalArgumentException("yuvakId is required to update attendance log");
        }

        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();

        AttendanceLog attendanceLog = attendanceLogRepository
                .findByYuvakIdAndAttendanceDate(request.getYuvakId(), date)
                .orElseGet(() -> {
                    Yuvak yuvak = yuvakRepository.findById(request.getYuvakId())
                            .orElseThrow(() -> new RuntimeException("Yuvak not found with id: " + request.getYuvakId()));
                    AttendanceLog newLog = new AttendanceLog();
                    newLog.setYuvak(yuvak);
                    newLog.setAttendanceDate(date);
                    return newLog;
                });

        Boolean prevPresent = attendanceLog.getPresent();
        Boolean prevUniform = attendanceLog.getUniform();
        Boolean prevCarryingDiary = attendanceLog.getCarryingDiary();

        if (request.getPresent() != null) {
            attendanceLog.setPresent(request.getPresent());
        }

        if (request.getUniform() != null) {
            attendanceLog.setUniform(request.getUniform());
        }

        if (request.getCarryingDiary() != null) {
            attendanceLog.setCarryingDiary(request.getCarryingDiary());
        }

        AttendanceLog savedLog = attendanceLogRepository.save(attendanceLog);
        Yuvak yuvak = savedLog.getYuvak();

        // 2. When marked present (and was not present before)
        if (Boolean.TRUE.equals(savedLog.getPresent()) && !Boolean.TRUE.equals(prevPresent)) {
            PointsLog presentLog = new PointsLog();
            presentLog.setYuvak(yuvak);
            presentLog.setType("increment");
            presentLog.setPoints(100);
            presentLog.setReason(yuvak.getFullName() + " Attended sabha on " + date);
            presentLog.setLoggedDate(Instant.now());
            pointsLogRepository.save(presentLog);
        }

        // 3. When marked present but not uniformed (and was not recorded as no-uniform before)
        if (Boolean.TRUE.equals(savedLog.getPresent()) && Boolean.FALSE.equals(savedLog.getUniform()) && !Boolean.FALSE.equals(prevUniform)) {
            PointsLog uniformLog = new PointsLog();
            uniformLog.setYuvak(yuvak);
            uniformLog.setType("decrement");
            uniformLog.setPoints(50);
            uniformLog.setReason(yuvak.getFullName() + " was not in uniform on " + date);
            uniformLog.setLoggedDate(Instant.now());
            pointsLogRepository.save(uniformLog);
        }

        // 4. When marked present but did not bring diary (and was not recorded as no-diary before)
        if (Boolean.TRUE.equals(savedLog.getPresent()) && Boolean.FALSE.equals(savedLog.getCarryingDiary()) && !Boolean.FALSE.equals(prevCarryingDiary)) {
            PointsLog diaryLog = new PointsLog();
            diaryLog.setYuvak(yuvak);
            diaryLog.setType("decrement");
            diaryLog.setPoints(50);
            diaryLog.setReason(yuvak.getFullName() + " did not bring diary on " + date);
            diaryLog.setLoggedDate(Instant.now());
            pointsLogRepository.save(diaryLog);
        }

        return savedLog;
    }
}
