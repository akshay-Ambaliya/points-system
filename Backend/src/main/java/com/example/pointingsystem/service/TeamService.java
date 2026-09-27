package com.example.pointingsystem.service;

import com.example.pointingsystem.dto.TeamRequest;
import com.example.pointingsystem.entity.Team;
import com.example.pointingsystem.entity.Yuvak;
import com.example.pointingsystem.repository.PointsLogRepository;
import com.example.pointingsystem.repository.TeamRepository;
import com.example.pointingsystem.repository.YuvakRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final YuvakRepository yuvakRepository;
    private final PointsLogRepository pointsLogRepository;

    public TeamService(TeamRepository teamRepository,
                       YuvakRepository yuvakRepository,
                       PointsLogRepository pointsLogRepository) {
        this.teamRepository = teamRepository;
        this.yuvakRepository = yuvakRepository;
        this.pointsLogRepository = pointsLogRepository;
    }

    @Transactional
    public Team saveTeam(TeamRequest request) {
        Team team = new Team();
        team.setTeamName(request.getTeamName());

        if (request.getLeaderId() != null) {
            Yuvak leader = yuvakRepository.findById(request.getLeaderId())
                    .orElseThrow(() -> new RuntimeException("Leader not found with id: " + request.getLeaderId()));
            team.setLeader(leader);
        }

        if (request.getYuvakIds() != null && !request.getYuvakIds().isEmpty()) {
            List<Yuvak> yuvaks = yuvakRepository.findAllById(request.getYuvakIds());
            team.setYuvaks(yuvaks);
        }

        Team savedTeam = teamRepository.save(team);
        populateTeamPoints(Collections.singletonList(savedTeam));
        return savedTeam;
    }

    public List<Team> getAllTeams() {
        List<Team> teams = teamRepository.findAll();
        populateTeamPoints(teams);
        return teams;
    }

    public Team getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));
        populateTeamPoints(Collections.singletonList(team));
        return team;
    }

    @Transactional
    public Team updateTeam(Long id, TeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found with id: " + id));

        if (request.getTeamName() != null) {
            team.setTeamName(request.getTeamName());
        }

        if (request.getLeaderId() != null) {
            Yuvak leader = yuvakRepository.findById(request.getLeaderId())
                    .orElseThrow(() -> new RuntimeException("Leader not found with id: " + request.getLeaderId()));
            team.setLeader(leader);
        } else {
            team.setLeader(null);
        }

        if (request.getYuvakIds() != null) {
            List<Yuvak> yuvaks = yuvakRepository.findAllById(request.getYuvakIds());
            team.setYuvaks(yuvaks);
        } else {
            team.setYuvaks(new ArrayList<>());
        }

        Team savedTeam = teamRepository.save(team);
        populateTeamPoints(Collections.singletonList(savedTeam));
        return savedTeam;
    }

    private void populateTeamPoints(List<Team> teams) {
        if (teams == null || teams.isEmpty()) {
            return;
        }

        List<Object[]> results = pointsLogRepository.findTotalPointsPerYuvak();
        Map<Long, Integer> yuvakPointsMap = new HashMap<>();
        for (Object[] row : results) {
            Long yuvakId = (Long) row[0];
            Long totalPoints = (Long) row[1];
            if (yuvakId != null && totalPoints != null) {
                yuvakPointsMap.put(yuvakId, totalPoints.intValue());
            }
        }

        for (Team team : teams) {
            Set<Long> memberIds = new HashSet<>();

            // Filter leader: consider only if active
            if (team.getLeader() != null && team.getLeader().getId() != null) {
                if (Boolean.FALSE.equals(team.getLeader().getActive())) {
                    team.setLeader(null);
                } else {
                    memberIds.add(team.getLeader().getId());
                    team.getLeader().setPoints(yuvakPointsMap.getOrDefault(team.getLeader().getId(), 0));
                }
            }

            // Filter team members: consider only if active
            if (team.getYuvaks() != null) {
                List<Yuvak> activeMembers = team.getYuvaks().stream()
                        .filter(yuvak -> yuvak != null && yuvak.getId() != null && !Boolean.FALSE.equals(yuvak.getActive()))
                        .peek(yuvak -> yuvak.setPoints(yuvakPointsMap.getOrDefault(yuvak.getId(), 0)))
                        .collect(Collectors.toList());
                
                team.setYuvaks(activeMembers);

                for (Yuvak member : activeMembers) {
                    memberIds.add(member.getId());
                }
            }

            int teamTotal = 0;
            for (Long memberId : memberIds) {
                teamTotal += yuvakPointsMap.getOrDefault(memberId, 0);
            }
            team.setPoints(teamTotal);
        }
    }
}
