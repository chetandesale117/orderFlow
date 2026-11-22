package com.orderflow.user.service;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.user.dto.request.AddressRequest;
import com.orderflow.user.dto.request.UpdateProfileRequest;
import com.orderflow.user.dto.response.AddressResponse;
import com.orderflow.user.dto.response.UserProfileResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserProfileResponse getProfileByAuthUserId(UUID authUserId);
    UserProfileResponse updateProfile(UUID authUserId, UpdateProfileRequest request);
    AddressResponse addAddress(UUID authUserId, AddressRequest request);
    List<AddressResponse> getAddresses(UUID authUserId);
    AddressResponse updateAddress(UUID authUserId, UUID addressId, AddressRequest request);
    void deleteAddress(UUID authUserId, UUID addressId);
    PageResponse<UserProfileResponse> getAllUsers(int page, int size);
    UserProfileResponse getUserById(UUID userId);
    void createSkeletonProfile(UUID authUserId, String email, String firstName, String lastName);
}
