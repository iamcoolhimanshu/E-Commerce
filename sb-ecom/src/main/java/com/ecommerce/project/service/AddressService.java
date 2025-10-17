package com.ecommerce.project.service;

import com.ecommerce.project.Dto.AddressDto;
import com.ecommerce.project.entity.User;

import java.util.List;

public interface AddressService {

    AddressDto createAddress(AddressDto addressDTO, User user);

    List<AddressDto> getAddresses();

    AddressDto getAddressesById(Long addressId);

    List<AddressDto> getUserAddresses(User user);

    AddressDto updateAddress(Long addressId, AddressDto addressDTO);

    String deleteAddress(Long addressId);
}
