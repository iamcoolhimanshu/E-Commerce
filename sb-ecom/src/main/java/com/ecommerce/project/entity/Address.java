package com.ecommerce.project.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "addresses")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @NotBlank
    @Size(min = 5, message = "Street name must be atleast 5 character")
    private String street;

    @NotBlank
    @Size(min = 5, message = "building name must be atleast 5 character")
    private String buildingName;

    @NotBlank
    @Size(min = 4, message = "city name must be atleast 4 character")
    private String city;

    @NotBlank
    @Size(min = 2, message = "state name must be atleast 2 character")
    private String state;

    @NotBlank
    @Size(min = 2, message = "Country name must be atleast 5 character")
    private String country;

    @NotBlank
    @Size(min = 6, message = "Pincode name must be atleast 5 character")
    private String pincode;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Address(String pincode, Long addressId, String street, String buildingName, String city, String state, String country) {
        this.pincode = pincode;
        this.addressId = addressId;
        this.street = street;
        this.buildingName = buildingName;
        this.city = city;
        this.state = state;
        this.country = country;
    }
}
