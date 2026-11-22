package com.orderflow.user.service.impl;

import com.orderflow.common.dto.PageResponse;
import com.orderflow.common.exception.ResourceNotFoundException;
import com.orderflow.user.dto.request.AddressRequest;
import com.orderflow.user.dto.request.UpdateProfileRequest;
import com.orderflow.user.dto.response.AddressResponse;
import com.orderflow.user.dto.response.UserProfileResponse;
import com.orderflow.user.entity.Address;
import com.orderflow.user.entity.UserProfile;
import com.orderflow.user.repository.AddressRepository;
import com.orderflow.user.repository.UserProfileRepository;
import com.orderflow.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByAuthUserId(UUID authUserId) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "authUserId", authUserId));
        return toUserProfileResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID authUserId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "authUserId", authUserId));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());

        profile = userProfileRepository.save(profile);
        return toUserProfileResponse(profile);
    }

    @Override
    @Transactional
    public AddressResponse addAddress(UUID authUserId, AddressRequest request) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "authUserId", authUserId));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.resetDefaultAddressForUser(profile.getId());
        }

        Address address = Address.builder()
                .user(profile)
                .label(request.getLabel())
                .streetLine1(request.getStreetLine1())
                .streetLine2(request.getStreetLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .build();

        address = addressRepository.save(address);
        return toAddressResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(UUID authUserId) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "authUserId", authUserId));

        return addressRepository.findByUserId(profile.getId()).stream()
                .map(this::toAddressResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AddressResponse updateAddress(UUID authUserId, UUID addressId, AddressRequest request) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "authUserId", authUserId));

        Address address = addressRepository.findByIdAndUserId(addressId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.resetDefaultAddressForUser(profile.getId());
            address.setIsDefault(true);
        } else if (request.getIsDefault() != null) {
            address.setIsDefault(request.getIsDefault());
        }

        if (request.getLabel() != null) address.setLabel(request.getLabel());
        if (request.getStreetLine1() != null) address.setStreetLine1(request.getStreetLine1());
        if (request.getStreetLine2() != null) address.setStreetLine2(request.getStreetLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());

        address = addressRepository.save(address);
        return toAddressResponse(address);
    }

    @Override
    @Transactional
    public void deleteAddress(UUID authUserId, UUID addressId) {
        UserProfile profile = userProfileRepository.findByAuthUserId(authUserId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "authUserId", authUserId));

        Address address = addressRepository.findByIdAndUserId(addressId, profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", addressId));

        addressRepository.delete(address);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserProfileResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserProfile> profiles = userProfileRepository.findAll(pageable);

        List<UserProfileResponse> content = profiles.getContent().stream()
                .map(this::toUserProfileResponse)
                .collect(Collectors.toList());

        return PageResponse.of(content, page, size, profiles.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserById(UUID userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", userId));
        return toUserProfileResponse(profile);
    }

    @Override
    @Transactional
    public void createSkeletonProfile(UUID authUserId, String email, String firstName, String lastName) {
        if (userProfileRepository.existsByAuthUserId(authUserId)) {
            log.info("Profile already exists for authUserId: {}", authUserId);
            return;
        }

        UserProfile profile = UserProfile.builder()
                .authUserId(authUserId)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .addresses(new ArrayList<>())
                .build();

        userProfileRepository.save(profile);
        log.info("Created skeleton profile for user: {} ({})", email, authUserId);
    }

    private UserProfileResponse toUserProfileResponse(UserProfile profile) {
        List<AddressResponse> addressResponses = profile.getAddresses() != null
                ? profile.getAddresses().stream().map(this::toAddressResponse).collect(Collectors.toList())
                : List.of();

        return UserProfileResponse.builder()
                .id(profile.getId())
                .authUserId(profile.getAuthUserId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .phoneNumber(profile.getPhoneNumber())
                .dateOfBirth(profile.getDateOfBirth())
                .avatarUrl(profile.getAvatarUrl())
                .addresses(addressResponses)
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private AddressResponse toAddressResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .streetLine1(address.getStreetLine1())
                .streetLine2(address.getStreetLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
