package com.example.pointingsystem.controller;

import com.example.pointingsystem.dto.ApiResponse;
import com.example.pointingsystem.dto.YuvakRegistrationRequest;
import com.example.pointingsystem.entity.Yuvak;
import com.example.pointingsystem.service.RegistrationService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registration")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Yuvak>> registerYuvak(@RequestBody YuvakRegistrationRequest request) {
        Yuvak savedYuvak = registrationService.registerYuvak(request);
        ApiResponse<Yuvak> response = ApiResponse.success("Yuvak registered successfully", savedYuvak);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Yuvak>>> getAllYuvaks(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Yuvak> yuvaks = registrationService.getAllYuvaks(search, page, size);
        ApiResponse<Page<Yuvak>> response = ApiResponse.success("Registered yuvaks fetched successfully", yuvaks);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Yuvak>> updateYuvak(
            @PathVariable Long id,
            @RequestBody YuvakRegistrationRequest request) {
        Yuvak updatedYuvak = registrationService.updateYuvak(id, request);
        ApiResponse<Yuvak> response = ApiResponse.success("Yuvak updated successfully", updatedYuvak);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Yuvak>> deleteYuvak(@PathVariable Long id) {
        Yuvak inactivatedYuvak = registrationService.inactivateYuvak(id);
        ApiResponse<Yuvak> response = ApiResponse.success("Yuvak inactivated successfully", inactivatedYuvak);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reactivate")
    public ResponseEntity<ApiResponse<Yuvak>> reactivateYuvak(@PathVariable Long id) {
        Yuvak reactivatedYuvak = registrationService.reactivateYuvak(id);
        ApiResponse<Yuvak> response = ApiResponse.success("Yuvak reactivated successfully", reactivatedYuvak);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/inactive")
    public ResponseEntity<ApiResponse<Page<Yuvak>>> getInactiveYuvaks(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Yuvak> yuvaks = registrationService.getInactiveYuvaks(search, page, size);
        ApiResponse<Page<Yuvak>> response = ApiResponse.success("Inactive yuvaks fetched successfully", yuvaks);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Yuvak>>> getAllYuvaksList() {
        List<Yuvak> yuvaks = registrationService.getAllYuvaksList();
        ApiResponse<List<Yuvak>> response = ApiResponse.success("All registered yuvaks fetched successfully", yuvaks);
        return ResponseEntity.ok(response);
    }
}
