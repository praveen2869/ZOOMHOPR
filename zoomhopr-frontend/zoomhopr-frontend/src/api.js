const API_BASE = "";

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}


// =========================================================
// AUTH
// =========================================================

export async function login(email, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password
    })
  });

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("role", data.role);
  localStorage.setItem("email", data.email);

  return data;
}


export function logout() {
  [
    "accessToken",
    "refreshToken",
    "userId",
    "role",
    "email"
  ].forEach((key) => {
    localStorage.removeItem(key);
  });
}


export function token() {
  return localStorage.getItem("accessToken");
}


export function isLoggedIn() {
  return Boolean(token());
}


// =========================================================
// PROFILE
// =========================================================

export async function getProfile(
  userId = localStorage.getItem("userId")
) {
  return request(`/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token()}`
    }
  });
}


export async function updateProfile(
  payload,
  userId = localStorage.getItem("userId")
) {
  return request(`/api/users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token()}`
    },
    body: JSON.stringify(payload)
  });
}


// =========================================================
// VEHICLES
// =========================================================

export async function getVehicles(
  city = "Bengaluru",
  fuelType = "",
  transmission = ""
) {
  const params = new URLSearchParams();

  params.set("city", city);

  if (fuelType) {
    params.set("fuelType", fuelType);
  }

  if (transmission) {
    params.set("transmission", transmission);
  }

  const accessToken = token();

  console.log("Vehicle request:", {
    city,
    fuelType,
    transmission,
    hasToken: Boolean(accessToken)
  });

  return request(
    `/api/vehicles/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
}


export async function getVehicle(id) {
  return request(`/api/vehicles/${id}`, {
    headers: {
      Authorization: `Bearer ${token()}`
    }
  });
}


export async function getVehiclesByOwner(ownerId) {
  return request(`/api/vehicles/owner/${ownerId}`, {
    headers: {
      Authorization: `Bearer ${token()}`
    }
  });
}


// =========================================================
// HOST VEHICLES
// =========================================================

export async function createVehicle(payload) {
  const accessToken = token();
  const ownerId = localStorage.getItem("userId");

  if (!ownerId) {
    throw new Error(
      "User ID is missing. Please login again."
    );
  }

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request("/api/vehicles", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      ...payload,
      ownerId
    })
  });
}


export async function getMyVehicles(
  ownerId = localStorage.getItem("userId")
) {
  const accessToken = token();

  if (!ownerId) {
    throw new Error(
      "User ID is missing. Please login again."
    );
  }

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(
    `/api/vehicles/owner/${ownerId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
}


// =========================================================
// UPDATE HOST VEHICLE
// =========================================================
//
// Host can change:
//
// - Hourly rate
// - Daily rate
// - Daily KM limit
// - Extra KM rate
//
// =========================================================

export async function updateVehicle(
  id,
  payload
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/vehicles/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      hourlyRate: Number(payload.hourlyRate),
      dailyRate: Number(payload.dailyRate),
      dailyKmLimit: Number(payload.dailyKmLimit),
      extraKmRate: Number(payload.extraKmRate)
    })
  });
}


// =========================================================
// UPDATE VEHICLE STATUS
// =========================================================

export async function updateVehicleStatus(
  id,
  status
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/vehicles/${id}/status`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      status
    })
  });
}


// =========================================================
// BOOKINGS
// =========================================================

export async function getBookings(
  riderId = localStorage.getItem("userId")
) {
  return request(`/api/bookings/rider/${riderId}`, {
    headers: {
      Authorization: `Bearer ${token()}`
    }
  });
}


export async function createBooking({
  vehicleId,
  startTime,
  endTime
}) {
  const riderId = localStorage.getItem("userId");
  const accessToken = token();

  if (!riderId) {
    throw new Error(
      "User ID is missing. Please login again."
    );
  }

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request("/api/bookings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      riderId,
      vehicleId,
      startTime,
      endTime
    })
  });
}


// =========================================================
// CANCEL BOOKING
// =========================================================

export async function cancelBooking(id) {
  return request(`/api/bookings/${id}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`
    }
  });
}


// =========================================================
// START TRIP
// =========================================================

export async function startBooking(
  id,
  odometerReading
) {
  return request(`/api/bookings/${id}/start`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`
    },
    body: JSON.stringify({
      odometerReading: Number(odometerReading)
    })
  });
}


// =========================================================
// END TRIP
// =========================================================

export async function endBooking(
  id,
  odometerReading
) {
  return request(`/api/bookings/${id}/end`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`
    },
    body: JSON.stringify({
      odometerReading: Number(odometerReading)
    })
  });
}


// =========================================================
// CARPOOL / RIDE MATCHING
// =========================================================

export async function createRideOffer(payload) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const { driverId, ...ridePayload } = payload;

  return request("/api/rides/offers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(ridePayload)
  });
}


export async function getRideOffer(offerId) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/offers/${offerId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function getMyHostedRides(
  filter = "all"
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  const userId = localStorage.getItem("userId");

  if (!userId) {
    throw new Error(
      "User ID is missing. Please login again."
    );
  }

  return request(
    `/api/rides/offers/${userId}/my-rides?filter=${encodeURIComponent(filter)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
}


export async function getHostedRideRequests(
  offerId
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/offers/${offerId}/requests`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function acceptRideRequest(
  requestId
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/requests/${requestId}/accept`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function rejectRideRequest(
  requestId
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/requests/${requestId}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function cancelRideOffer(offerId) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/offers/${offerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function searchRides({
  lat,
  lng,
  radiusKm = 5,
  earliestDeparture,
  latestDeparture
}) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request("/api/rides/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      lat,
      lng,
      radiusKm,
      earliestDeparture,
      latestDeparture
    })
  });
}


export async function requestToJoinRide(
  offerId,
  seatsRequested
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/offers/${offerId}/requests`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      seatsRequested: Number(seatsRequested)
    })
  });
}


export async function getMyRideRequests() {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request("/api/rides/requests/my-requests", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function getRideRequest(requestId) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/requests/${requestId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function cancelRideRequest(
  requestId
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(`/api/rides/requests/${requestId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
}


export async function getDriverRides(
  driverId,
  filter = "all"
) {
  const accessToken = token();

  if (!accessToken) {
    throw new Error(
      "Authentication token is missing. Please login again."
    );
  }

  return request(
    `/api/rides/offers/driver/${driverId}/my-rides?filter=${encodeURIComponent(filter)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
}