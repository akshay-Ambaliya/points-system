package com.example.pointingsystem.dto;

import java.time.LocalDate;

public class AttendanceLogUpdateRequest {

    private Boolean present;
    private Boolean uniform;
    private Boolean carryingDiary;
    private LocalDate attendanceDate;
    private Long yuvakId;

    public AttendanceLogUpdateRequest() {
    }

    public AttendanceLogUpdateRequest(Boolean present, Boolean uniform, Boolean carryingDiary, LocalDate attendanceDate, Long yuvakId) {
        this.present = present;
        this.uniform = uniform;
        this.carryingDiary = carryingDiary;
        this.attendanceDate = attendanceDate;
        this.yuvakId = yuvakId;
    }

    public Boolean getPresent() {
        return present;
    }

    public void setPresent(Boolean present) {
        this.present = present;
    }

    public Boolean getUniform() {
        return uniform;
    }

    public void setUniform(Boolean uniform) {
        this.uniform = uniform;
    }

    public Boolean getCarryingDiary() {
        return carryingDiary;
    }

    public void setCarryingDiary(Boolean carryingDiary) {
        this.carryingDiary = carryingDiary;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public Long getYuvakId() {
        return yuvakId;
    }

    public void setYuvakId(Long yuvakId) {
        this.yuvakId = yuvakId;
    }
}
