package com.example.pointingsystem.controller;

import com.example.pointingsystem.dto.ApiResponse;
import com.example.pointingsystem.dto.TeamRequest;
import com.example.pointingsystem.entity.Team;
import com.example.pointingsystem.service.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    // 1. Save Team API
    @PostMapping
    public ResponseEntity<ApiResponse<Team>> saveTeam(@RequestBody TeamRequest request) {
        Team savedTeam = teamService.saveTeam(request);
        ApiResponse<Team> response = ApiResponse.success("Team saved successfully", savedTeam);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. Get All Teams API
    @GetMapping
    public ResponseEntity<ApiResponse<List<Team>>> getAllTeams() {
        List<Team> teams = teamService.getAllTeams();
        ApiResponse<List<Team>> response = ApiResponse.success("All teams fetched successfully", teams);
        return ResponseEntity.ok(response);
    }

    // 3. Get Team by ID API
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Team>> getTeamById(@PathVariable Long id) {
        Team team = teamService.getTeamById(id);
        ApiResponse<Team> response = ApiResponse.success("Team fetched successfully", team);
        return ResponseEntity.ok(response);
    }

    // 4. Update Team API
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Team>> updateTeam(@PathVariable Long id, @RequestBody TeamRequest request) {
        Team updatedTeam = teamService.updateTeam(id, request);
        ApiResponse<Team> response = ApiResponse.success("Team updated successfully", updatedTeam);
        return ResponseEntity.ok(response);
    }
}
