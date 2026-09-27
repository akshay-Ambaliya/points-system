package com.example.pointingsystem.dto;

import java.util.List;

public class TeamRequest {

    private String teamName;
    private Long leaderId;
    private List<Long> yuvakIds;

    public TeamRequest() {
    }

    public TeamRequest(String teamName, Long leaderId, List<Long> yuvakIds) {
        this.teamName = teamName;
        this.leaderId = leaderId;
        this.yuvakIds = yuvakIds;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public Long getLeaderId() {
        return leaderId;
    }

    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }

    public List<Long> getYuvakIds() {
        return yuvakIds;
    }

    public void setYuvakIds(List<Long> yuvakIds) {
        this.yuvakIds = yuvakIds;
    }
}
