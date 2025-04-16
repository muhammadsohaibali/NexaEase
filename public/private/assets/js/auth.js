function isValidEmail(email) {
  const emailProviders = [
    "@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com", "@live.com", "@msn.com", "@icloud.com", "@aol.com",
    "@mail.com", "@protonmail.com", "@zoho.com", "@gmx.com", "@yandex.com", "@tutanota.com", "@fastmail.com",
    "@inbox.com", "@rediffmail.com", "@web.de", "@seznam.cz", "@mail.ru", "@naver.com", "@qq.com", "@daum.net",
  ];

  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return (
    re.test(email) && emailProviders.some((domain) => email.endsWith(domain))
  );
}

async function requestOtp(e) {
  e.preventDefault();
  const [email, btn, btnText, btnLoader] = [
    document.getElementById("email").value,
    document.getElementById("send-otp-btn"),
    document.getElementById("btn-text"),
    document.getElementById("btn-loader")
  ];
  if (!isValidEmail(email)) return notify("Please enter a valid email address", "alert");
  try {
    btn.disabled = true;
    btnText.style.display = "none";
    btnLoader.classList.remove("hidden");
    const response = await fetch("/api/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    response.ok
      ? (notify("Check Your Email For OTP", "info"), toggleOtpState(true))
      : notify("Error sending OTP. Please try again", "error");
  } catch (err) {
    notify("Something went wrong. Try again.", "error");
  } finally {
    btn.disabled = true;
    btnText.style.display = "inline";
    btnLoader.classList.add("hidden");
  }
}

async function authenticateUser(e) {
  e.preventDefault();
  const [email, otp, btn, btnText, btnLoader] = [
    document.getElementById("email").value,
    document.getElementById("otp").value,
    document.getElementById("login-btn"),
    document.getElementById("login-text"),
    document.getElementById("login-loader")
  ];
  if (!isValidEmail(email)) return notify("Please enter a valid email address.", "alert");
  try {
    btn.disabled = true;
    btnText.style.display = "none";
    btnLoader.classList.remove("hidden");
    const response = await fetch("/api/login/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    if (response.ok) {
      window.location.href = "/";
    } else {
      const { error } = await response.json();
      if (error === "USER_NOT_FOUND") notify("No account found. Please sign up.", "alert");
    }
  } catch (err) {
    console.error("Authentication Error:", err);
    notify("Something went wrong. Try again.", "error");
  } finally {
    btn.disabled = false;
    btnText.style.display = "inline";
    btnLoader.classList.add("hidden");
  }
}

async function registerUser(e) {
  e.preventDefault();
  const [email, otp, phone, username, address, btn, btnText, btnLoader] = [
    document.getElementById("email").value,
    document.getElementById("otp").value,
    document.getElementById("phone_number").value,
    document.getElementById("username").value,
    document.getElementById("address").value,
    document.getElementById("register-btn"),
    document.getElementById("register-text"),
    document.getElementById("register-loader")
  ];
  if (!isValidEmail(email)) return notify("Please enter a valid email address.", 'alert');
  try {
    btn.disabled = true;
    btnText.style.display = "none";
    btnLoader.classList.remove("hidden");
    const response = await fetch("/api/register/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, phone_number: phone, username, address })
    });
    response.ok
      ? (window.location.href = "/")
      : notify("Error in registration. Please try again.", 'error');
  } catch (err) {
    notify("Something went wrong. Try again.", 'error');
  } finally {
    btn.disabled = false;
    btnText.style.display = "inline";
    btnLoader.classList.add("hidden");
  }
}

async function fetchUserProfile() {
  try {
    const response = await fetch("/api/me/info", {
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
  const [phoneNumber, address, fullName, btn, btnText, btnLoader] = [
    document.getElementById("phoneNumber").value,
    document.getElementById("address").value,
    document.getElementById("name").value,
    document.getElementById("update-btn"),
    document.getElementById("update-text"),
    document.getElementById("update-loader")
  ];
  try {
    btn.disabled = true;
    btnText.style.display = "none";
    btnLoader.classList.remove("hidden");
    const response = await fetch("/api/account/update", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, address, fullName })
    });
    if (response.ok) {
      window.location.href = "/";
    } else {
      const resData = await response.json();
      notify(resData.message, resData.type);
      setTimeout(() => (window.location.href = "/"), 1000);
    }
  } catch (err) {
    notify("Something went wrong. Try again.", 'error');
  } finally {
    btn.disabled = false;
    btnText.style.display = "inline";
    btnLoader.classList.add("hidden");
  }
}

function toggleOtpState(state) {
  document.getElementById("otp").disabled = !state;
  document.getElementById("otp").style.cursor = state ? "text" : "default";
  document.getElementById("login-btn").disabled = !state;
  document.getElementById("send-otp-btn").disabled = state;
}
