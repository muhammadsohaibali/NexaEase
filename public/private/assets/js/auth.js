function isValidEmail(email) {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
}

async function requestOtp(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  if (isValidEmail(email)) {
    try {
      toggleOtpState(true);
      const response = await fetch("/api/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      response.ok ? notify("Check Your Email For OTP") : notify("Error sending OTP. Please try again.");
    } catch (err) {
      console.error("OTP Request Error:", err);
    }
  } else {
    notify("Please enter a valid email address.");
  }
}

async function authenticateUser(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  if (isValidEmail(email)) {
    try {
      const response = await fetch("/api/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });
      if (response.ok) window.location.href = "/";
      else {
        const { error } = await response.json();
        if (error === "USER_NOT_FOUND") notify("No account found. Please sign up.");
      }
    } catch (err) {
      console.error("Authentication Error:", err);
    }
  } else {
    notify("Please enter a valid email address.");
  }
}

async function registerUser(e) {
  e.preventDefault();
  const payload = {
    email: document.getElementById("email").value,
    otp: document.getElementById("otp").value,
    phone_number: document.getElementById("phone_number").value,
    username: document.getElementById("username").value,
    address: document.getElementById("address").value
  };
  if (isValidEmail(payload.email)) {
    try {
      const response = await fetch("/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      response.ok ? window.location.href = "/" : notify("Error in registration. Please try again.");
    } catch (err) {
      console.error("Registration Error:", err);
    }
  } else {
    notify("Please enter a valid email address.");
  }
}

async function fetchUserProfile() {
  try {
    const response = await fetch("/api/me/profile", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      Object.entries(data).forEach(([key, value]) => {
        const field = document.getElementById(key);
        if (field) field.value = value;
      });
    }
  } catch (err) {
    console.error("Request Failed:", err);
  }
}

async function updateUserProfile(e) {
  e.preventDefault();
  const payload = {
    phoneNumber: document.getElementById("phoneNumber").value,
    address: document.getElementById("address").value,
    fullName: document.getElementById("name").value
  };
  try {
    const response = await fetch("/api/account/update", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    response.ok ? window.location.href = "/" : (notify((await response.json()).message), setTimeout(() => window.location.href = "/", 1000));
  } catch (err) {
    console.error("Update Request Failed:", err);
  }
}

function toggleOtpState(state) {
  document.getElementById("otp").disabled = !state;
  document.getElementById("otp").style.cursor = state ? "text" : "default";
  document.getElementById("login-btn").disabled = !state;
  document.getElementById("send-otp-btn").disabled = state;
}
