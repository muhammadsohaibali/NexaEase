async function sendContactFormData() {
    const name = document.getElementById("full-name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const number = document.getElementById("phone")?.value.trim();
    const message = document.getElementById("message")?.value.trim();

    const validatePakistaniNumber = (num) =>
        /^((\+92|92|0)?[3][0-9]{9})$/.test(num) ? num.slice(-10).padStart(11, "0") : null;

    if (!message || (!window.isUserLoggedIn && (!name || !email || !number)))
        return notify("Please fill all required fields");

    let validNumber = window.isUserLoggedIn ? null : validatePakistaniNumber(number);
    if (!window.isUserLoggedIn && !validNumber)
        return notify("Invalid Phone Number");

    const inquiryData = { name, email, number: validNumber, message };

    try {
        const response = await fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inquiryData),
        });

        const result = await response.json();
        if (!response.ok) return notify(result.message);
        if (!response.ok) throw new Error(result.error || "Something went wrong");

        console.log(result.message);
        notify(result.message);
        if (!window.isUserLoggedIn)
            [document.getElementById("full-name").value,
            document.getElementById("email").value,
            document.getElementById("phone").value,
            document.getElementById("message").value] = ['', '', '', ''];
        else document.getElementById("message").value = ''
    } catch (error) {
        console.log(error.message);
    }
}

window.onload = async () => {
    try {
        const response = await fetch("/api/me/profile", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const user = await response.json();

        if (user.email) {
            window.isUserLoggedIn = true;
            document.getElementById("full-name").value = user.name;
            document.getElementById("email").value = user.email;
            document.getElementById("phone").value = user.phoneNumber;
            ["full-name", "email", "phone"].forEach((id) => {
                const field = document.getElementById(id);
                if (field) {
                    field.disabled = true;
                    field.classList.add("blurred");
                    field.title = "Auto-filled by NexaEase";
                }
            });
        }
    } catch (error) {
    }
};