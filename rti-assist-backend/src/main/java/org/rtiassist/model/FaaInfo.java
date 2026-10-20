package org.rtiassist.model;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FaaInfo {
    private String name;
    private String designation;
    private String email;
    private String phone;
    private String address;

    public FaaInfo() {}

    public FaaInfo(String name, String designation, String email, String phone, String address) {
        this.name = name;
        this.designation = designation;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
