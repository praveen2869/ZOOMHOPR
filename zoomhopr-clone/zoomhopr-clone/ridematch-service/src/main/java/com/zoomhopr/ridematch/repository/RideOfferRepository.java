package com.zoomhopr.ridematch.repository;

import com.zoomhopr.ridematch.entity.RideOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface RideOfferRepository extends JpaRepository<RideOffer, String> {

    /**
     * Naive bounding-box + Haversine distance filter for "rides starting near me".
     * For production scale, swap this for PostGIS ST_DWithin or a Redis GEO index.
     */
    @Query(value = """
        SELECT * FROM ride_offers r
        WHERE r.status = 'OPEN'
          AND r.available_seats > 0
          AND r.departure_time BETWEEN :windowStart AND :windowEnd
          AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(r.origin_lat)) *
                cos(radians(r.origin_lng) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(r.origin_lat))
              )) <= :radiusKm
        ORDER BY r.departure_time ASC
        """, nativeQuery = true)
    List<RideOffer> findNearbyOpenRides(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusKm") double radiusKm,
            @Param("windowStart") Instant windowStart,
            @Param("windowEnd") Instant windowEnd);

    List<RideOffer> findByDriverId(String driverId);

    List<RideOffer> findByDriverIdAndStatusInOrderByDepartureTimeAsc(
            String driverId,
            Collection<RideOffer.RideStatus> statuses
    );

    List<RideOffer> findByDriverIdAndDepartureTimeAfterOrderByDepartureTimeAsc(
            String driverId,
            Instant departureTime
    );

    List<RideOffer> findByDriverIdAndDepartureTimeBeforeOrderByDepartureTimeDesc(
            String driverId,
            Instant departureTime
    );

    List<RideOffer> findByIdInOrderByDepartureTimeAsc(Collection<String> ids);
}
