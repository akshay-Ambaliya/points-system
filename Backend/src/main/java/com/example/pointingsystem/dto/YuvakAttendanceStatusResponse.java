package com.example.pointingsystem.dto;

public class YuvakAttendanceStatusResponse {

    private Long yuvakId;
    private String fullName;
    private Boolean present;
    private Boolean uniform;
    private Boolean carryingDiary;
    private Long attendanceLogId;

    public YuvakAttendanceStatusResponse() {
    }

    public YuvakAttendanceStatusResponse(Long yuvakId, String fullName, Boolean present, Boolean uniform, Boolean carryingDiary, Long attendanceLogId) {
        this.yuvakId = yuvakId;
        this.fullName = fullName;
        this.present = present != null ? present : false;
        this.uniform = uniform;
        this.carryingDiary = carryingDiary;
        this.attendanceLogId = attendanceLogId;
    }

    public Long getYuvakId() {
        return yuvakId;
    }

    public void setYuvakId(Long yuvakId) {
        this.yuvakId = yuvakId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public Long getAttendanceLogId() {
        return attendanceLogId;
    }

    public void setAttendanceLogId(Long attendanceLogId) {
        this.attendanceLogId = attendanceLogId;
    }
}
