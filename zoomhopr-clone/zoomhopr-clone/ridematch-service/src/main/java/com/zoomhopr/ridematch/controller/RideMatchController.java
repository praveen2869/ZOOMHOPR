package com.zoomhopr.ridematch.controller;

import com.zoomhopr.ridematch.entity.RideOffer;
import com.zoomhopr.ridematch.entity.RideRequest;
import com.zoomhopr.ridematch.service.RideMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rides")
@RequiredArgsConstructor
public class RideMatchController {

    private final RideMatchService rideMatchService;

    @PostMapping("/offers")
    public ResponseEntity<RideOffer> createOffer(@RequestBody RideOffer rideOffer) {
        return ResponseEntity.ok(rideMatchService.createOffer(rideOffer));
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(rideMatchService.search(from, to));
    }

    @GetMapping("/offers/{offerId}")
    public ResponseEntity<RideOffer> getOffer(@PathVariable String offerId) {
        return ResponseEntity.ok(rideMatchService.getOffer(offerId));
    }

    @GetMapping("/offers/{offerId}/requests")
    public ResponseEntity<?> getOfferRequests(@PathVariable String offerId) {
        return ResponseEntity.ok(rideMatchService.getOfferRequests(offerId));
    }

    @PostMapping("/offers/{offerId}/requests")
    public ResponseEntity<RideRequest> requestSeat(@PathVariable String offerId, @RequestBody RideRequest rideRequest) {
        return ResponseEntity.ok(rideMatchService.requestSeat(offerId, rideRequest));
    }

    @GetMapping("/requests/my")
    public ResponseEntity<?> getMyRequests() {
        return ResponseEntity.ok(rideMatchService.getMyRequests());
    }

    @GetMapping("/requests/{requestId}")
    public ResponseEntity<RideRequest> getRequest(@PathVariable String requestId) {
        return ResponseEntity.ok(rideMatchService.getRequest(requestId));
    }

    @PutMapping("/requests/{requestId}/accept")
    public ResponseEntity<RideRequest> acceptRequest(@PathVariable String requestId) {
        return ResponseEntity.ok(rideMatchService.acceptRequest(requestId));
    }

    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<RideRequest> rejectRequest(@PathVariable String requestId) {
        return ResponseEntity.ok(rideMatchService.rejectRequest(requestId));
    }

    @PutMapping("/requests/{requestId}/cancel")
    public ResponseEntity<RideRequest> cancelRequest(@PathVariable String requestId) {
        return ResponseEntity.ok(rideMatchService.cancelRequest(requestId));
    }

    @PutMapping("/offers/{offerId}/cancel")
    public ResponseEntity<RideOffer> cancelRide(@PathVariable String offerId) {
        return ResponseEntity.ok(rideMatchService.cancelRide(offerId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getByDriver(@PathVariable String driverId) {
        return ResponseEntity.ok(rideMatchService.getByDriver(driverId));
    }

    @GetMapping("/driver/{driverId}/my-rides")
    public ResponseEntity<?> getDriverRides(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "all") String filter) {
        return ResponseEntity.ok(rideMatchService.getDriverRides(driverId, filter));
    }

    @GetMapping("/rider/{riderId}/my-rides")
    public ResponseEntity<?> getMyRides(@PathVariable String riderId) {
        return ResponseEntity.ok(rideMatchService.getMyRides(riderId));
    }
}
