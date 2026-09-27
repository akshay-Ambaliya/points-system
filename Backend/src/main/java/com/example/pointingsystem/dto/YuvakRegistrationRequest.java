package com.example.pointingsystem.dto;

public class YuvakRegistrationRequest {

    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String remarks;

    public YuvakRegistrationRequest() {
    }

    public YuvakRegistrationRequest(String fullName, String phone, String email, String address, String remarks) {
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.remarks = remarks;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
