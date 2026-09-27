package com.example.pointingsystem.dto;

public class PointsLogRequest {
    private Long yuvakId;
    private String type; // "increment" or "decrement"
    private Integer points;
    private String reason;

    public PointsLogRequest() {}

    public PointsLogRequest(Long yuvakId, String type, Integer points, String reason) {
        this.yuvakId = yuvakId;
        this.type = type;
        this.points = points;
        this.reason = reason;
    }

    public Long getYuvakId() {
        return yuvakId;
    }

    public void setYuvakId(Long yuvakId) {
        this.yuvakId = yuvakId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
