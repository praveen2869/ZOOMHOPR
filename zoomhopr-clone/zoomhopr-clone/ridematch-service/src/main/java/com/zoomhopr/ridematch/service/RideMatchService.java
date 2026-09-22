package com.zoomhopr.ridematch.service;

import com.zoomhopr.ridematch.entity.RideOffer;
import com.zoomhopr.ridematch.entity.RideRequest;
import com.zoomhopr.ridematch.repository.RideOfferRepository;
import com.zoomhopr.ridematch.repository.RideRequestRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RideMatchService {

    private static final EnumSet<RideOffer.RideStatus> ACTIVE_RIDE_STATUSES = EnumSet.of(
            RideOffer.RideStatus.OPEN,
            RideOffer.RideStatus.FULL);

    private static final EnumSet<RideRequest.RequestStatus> ACTIVE_REQUEST_STATUSES = EnumSet.of(
            RideRequest.RequestStatus.PENDING,
            RideRequest.RequestStatus.ACCEPTED);

    private final RideOfferRepository rideOfferRepository;
    private final RideRequestRepository rideRequestRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public RideOffer createOffer(RideOffer rideOffer) {
        String driverId = authenticatedUserService.getAuthenticatedUserId();
        rideOffer.setId(null);
        rideOffer.setDriverId(driverId);
        return rideOfferRepository.save(rideOffer);
    }

    public List<RideOffer> search(String source, String destination) {
        Instant now = Instant.now();
        return rideOfferRepository.findNearbyOpenRides(0, 0, Double.MAX_VALUE, now, now.plus(365, ChronoUnit.DAYS));
    }

    public RideRequest requestSeat(String offerId, RideRequest rideRequest) {
        RideOffer offer = getOffer(offerId);
        String riderId = authenticatedUserService.getAuthenticatedUserId();
        if (offer.getDriverId().equals(riderId)) {
            throw new IllegalStateException("Driver cannot request their own ride");
        }
        rideRequest.setId(null);
        rideRequest.setRideOfferId(offerId);
        rideRequest.setRiderId(riderId);
        rideRequest.setStatus(RideRequest.RequestStatus.PENDING);
        return rideRequestRepository.save(rideRequest);
    }

    public RideRequest acceptRequest(String requestId) {
        RideRequest rideRequest = getRideRequest(requestId);
        RideOffer offer = getOffer(rideRequest.getRideOfferId());
        ensureDriverOwnsOffer(offer);
        ensurePendingRequest(rideRequest);
        rideRequest.setStatus(RideRequest.RequestStatus.ACCEPTED);
        return rideRequestRepository.save(rideRequest);
    }

    public RideRequest rejectRequest(String requestId) {
        RideRequest rideRequest = getRideRequest(requestId);
        RideOffer offer = getOffer(rideRequest.getRideOfferId());
        ensureDriverOwnsOffer(offer);
        ensurePendingRequest(rideRequest);
        rideRequest.setStatus(RideRequest.RequestStatus.REJECTED);
        return rideRequestRepository.save(rideRequest);
    }

    public RideRequest cancelRequest(String requestId) {
        RideRequest rideRequest = getRideRequest(requestId);
        RideOffer offer = getOffer(rideRequest.getRideOfferId());
        String userId = authenticatedUserService.getAuthenticatedUserId();
        boolean isDriver = offer.getDriverId().equals(userId);
        boolean isRider = rideRequest.getRiderId().equals(userId);
        if (!isDriver && !isRider) {
            throw new IllegalStateException("User is not authorized for this resource");
        }
        rideRequest.setStatus(RideRequest.RequestStatus.CANCELLED);
        return rideRequestRepository.save(rideRequest);
    }

    public RideOffer cancelRide(String offerId) {
        RideOffer offer = getOffer(offerId);
        ensureDriverOwnsOffer(offer);
        offer.setStatus(RideOffer.RideStatus.CANCELLED);
        return rideOfferRepository.save(offer);
    }

    public RideOffer getOffer(String id) {
        return rideOfferRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ride offer not found: " + id));
    }

    public List<RideRequest> getOfferRequests(String offerId) {
        RideOffer offer = getOffer(offerId);
        ensureDriverOwnsOffer(offer);
        return rideRequestRepository.findByRideOfferId(offerId);
    }

    public List<RideOffer> getByDriver(String driverId) {
        return rideOfferRepository.findByDriverId(driverId);
    }

    public List<RideOffer> getDriverRides(String driverId, String filter) {
        ensureAuthenticatedUserMatches(driverId);
        Instant now = Instant.now();
        return switch (filter == null ? "all" : filter.toLowerCase()) {
            case "upcoming" -> rideOfferRepository.findByDriverIdAndStatusInOrderByDepartureTimeAsc(
                    driverId,
                    ACTIVE_RIDE_STATUSES);
            case "cancelled", "completed", "all" -> rideOfferRepository.findByDriverId(driverId);
            default -> throw new IllegalArgumentException("Unsupported filter: " + filter);
        };
    }

    public List<RideOffer> getMyRides(String riderId) {
        ensureAuthenticatedUserMatches(riderId);
        List<RideRequest> requests = rideRequestRepository.findByRiderIdAndStatusIn(
                riderId,
                ACTIVE_REQUEST_STATUSES);
        List<String> offerIds = requests.stream()
                .map(RideRequest::getRideOfferId)
                .distinct()
                .toList();
        return offerIds.isEmpty() ? List.of() : rideOfferRepository.findByIdInOrderByDepartureTimeAsc(offerIds);
    }

    public List<RideRequest> getMyRequests() {
        String riderId = authenticatedUserService.getAuthenticatedUserId();
        return rideRequestRepository.findByRiderId(riderId);
    }

    public RideRequest getRequest(String requestId) {
        RideRequest rideRequest = getRideRequest(requestId);
        RideOffer offer = getOffer(rideRequest.getRideOfferId());
        String userId = authenticatedUserService.getAuthenticatedUserId();
        if (!rideRequest.getRiderId().equals(userId) && !offer.getDriverId().equals(userId)) {
            throw new IllegalStateException("User is not authorized for this resource");
        }
        return rideRequest;
    }

    private RideRequest getRideRequest(String requestId) {
        return rideRequestRepository.findById(requestId)
                .orElseThrow(() -> new NoSuchElementException("Ride request not found: " + requestId));
    }

    private void ensurePendingRequest(RideRequest rideRequest) {
        if (rideRequest.getStatus() != RideRequest.RequestStatus.PENDING) {
            throw new IllegalStateException("Ride request is not pending");
        }
    }

    private void ensureAuthenticatedUserMatches(String userId) {
        String authenticatedUserId = authenticatedUserService.getAuthenticatedUserId();
        if (!authenticatedUserId.equals(userId)) {
            throw new IllegalStateException("User is not authorized for this resource");
        }
    }

    private void ensureDriverOwnsOffer(RideOffer offer) {
        String authenticatedUserId = authenticatedUserService.getAuthenticatedUserId();
        if (!authenticatedUserId.equals(offer.getDriverId())) {
            throw new IllegalStateException("Only the driver can manage this ride");
        }
    }
}
