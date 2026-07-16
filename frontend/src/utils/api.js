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
