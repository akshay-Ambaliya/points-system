package com.example.pointingsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "points_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PointsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "yuvak_id", nullable = false)
    private Yuvak yuvak;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "logged_date", nullable = false)
    private Instant loggedDate;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        if (this.loggedDate == null) {
            this.loggedDate = now;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Yuvak getYuvak() {
        return yuvak;
    }

    public void setYuvak(Yuvak yuvak) {
        this.yuvak = yuvak;
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

    public Instant getLoggedDate() {
        return loggedDate;
    }

    public void setLoggedDate(Instant loggedDate) {
        this.loggedDate = loggedDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
