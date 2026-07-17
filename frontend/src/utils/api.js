const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Authentication failed. Please check your credentials.");
  }
  return data;
}

export async function registerUser({ email, password, fullName, phone, whatsappNumber, role, avatarUrl }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      phone,
      whatsapp_number: whatsappNumber,
      role,
      avatar_url: avatarUrl || "",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Registration failed. Please check your inputs.");
  }
  return data;
}

export function saveSession(token, profile) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("user_profile", JSON.stringify(profile));
}

export function getSession() {
  const token = localStorage.getItem("access_token");
  const profile = localStorage.getItem("user_profile");
  return token && profile ? { token, profile: JSON.parse(profile) } : null;
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_profile");
}

export async function fetchCurrentWeather(lat, lng) {
  const response = await fetch(`${API_BASE_URL}/api/weather/current?lat=${lat}&lng=${lng}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch weather data.");
  }
  return data;
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch categories.");
  }
  return data;
}

export async function fetchFoodPosts() {
  const response = await fetch(`${API_BASE_URL}/api/posts`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch food posts.");
  }
  return data;
}

export async function createFoodPost(payload, token) {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to create food post.");
  }
  return data;
}

export async function fetchAIHistory(token) {
  const response = await fetch(`${API_BASE_URL}/api/ai/history`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch AI history.");
  }
  return data;
}

export async function fetchAIRecommendation(payload, token) {
  const response = await fetch(`${API_BASE_URL}/api/ai/recommend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to get AI recommendation.");
  }
  return data;
}

export async function simulateIoT(recommendationId, token) {
  const response = await fetch(`${API_BASE_URL}/api/ai/simulate/${recommendationId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to generate simulation.");
  }
  return data;
}

export async function fetchPostOffers(postId, token) {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/offers`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch post offers.");
  }
  return data;
}

export async function submitOffer(postId, payload, token) {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to submit offer.");
  }
  return data;
}

export async function acceptOffer(offerId, token) {
  const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/accept`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to accept offer.");
  }
  return data;
}

export async function rejectOffer(offerId, token) {
  const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/reject`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to reject offer.");
  }
  return data;
}

export async function withdrawOffer(offerId, token) {
  const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to withdraw offer.");
  }
  return data;
}

export async function getWhatsAppLink(offerId, token) {
  const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/contact`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch WhatsApp contact.");
  }
  return data;
}

export async function fetchMyPosts(token) {
  const response = await fetch(`${API_BASE_URL}/api/posts/mine`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch my posts.");
  }
  return data;
}

export async function fetchMyOffers(token) {
  const response = await fetch(`${API_BASE_URL}/api/offers/mine`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch my offers.");
  }
  return data;
}

export async function fetchMyTransactions(token) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/mine`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch transactions.");
  }
  return data;
}

export async function updateTransactionStatus(txId, status, token) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${txId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to update transaction status.");
  }
  return data;
}

export async function submitReview(payload, token) {
  const response = await fetch(`${API_BASE_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to submit review.");
  }
  return data;
}

export async function fetchUserReviews(userId) {
  const response = await fetch(`${API_BASE_URL}/api/reviews/user/${userId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to fetch user reviews.");
  }
  return data;
}

export async function cancelPost(postId, token) {
  const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Failed to cancel post.");
  }
  return data;
}


