package com.example.pointingsystem.dto;

import java.time.Instant;

public class PointsLogResponse {

    private Long id;
    private String yuvakName;
    private Integer points;
    private String type;
    private String reason;
    private Instant date;

    public PointsLogResponse() {
    }

    public PointsLogResponse(Long id, String yuvakName, Integer points, String type, String reason, Instant date) {
        this.id = id;
        this.yuvakName = yuvakName;
        this.points = points;
        this.type = type;
        this.reason = reason;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getYuvakName() {
        return yuvakName;
    }

    public void setYuvakName(String yuvakName) {
        this.yuvakName = yuvakName;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
