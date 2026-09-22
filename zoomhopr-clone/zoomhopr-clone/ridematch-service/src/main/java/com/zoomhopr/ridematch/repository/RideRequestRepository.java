package com.zoomhopr.ridematch.repository;

import com.zoomhopr.ridematch.entity.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface RideRequestRepository extends JpaRepository<RideRequest, String> {
    List<RideRequest> findByRideOfferId(String rideOfferId);
    List<RideRequest> findByRideOfferIdAndStatus(String rideOfferId, RideRequest.RequestStatus status);
    List<RideRequest> findByRiderId(String riderId);
    List<RideRequest> findByRiderIdAndStatusIn(String riderId, Collection<RideRequest.RequestStatus> statuses);
}
