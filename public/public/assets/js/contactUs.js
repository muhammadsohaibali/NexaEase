async function sendContactFormData() {
    const [nameInp, emailInp, numberInp, messageInp] =
        ["full-name", "email", "phone", "message"].map(id => document.getElementById(id));

    const [name, email, number, message] =
        [nameInp, emailInp, numberInp, messageInp].map(inp => inp?.value.trim());

    const validatePakistaniNumber = (num) =>
        /^((\+92|92|0)?[3][0-9]{9})$/.test(num) ? num.slice(-10).padStart(11, "0") : null;

    if (!message || (!window.isUserLoggedIn && (!name || !email || !number)))
        return notify("Please fill all required fields", 'alert');

    let validNumber = window.isUserLoggedIn ? null : validatePakistaniNumber(number);
    if (!window.isUserLoggedIn && !validNumber)
        return (numberInp?.focus(), notify("Invalid Phone Number", 'alert'))

    const inquiryData = { name, email, number: validNumber, message };

    try {
        const response = await fetch("/api/inquiries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inquiryData),
        });

        const result = await response.json();
        if (!response.ok) return (notify(result.message, result.type), console.error(result.error));
        notify(result.message, result.type);
        if (!window.isUserLoggedIn) [nameInp, emailInp, numberInp, messageInp].forEach(el => el.value = '');
        else messageInp.value = '';
    } catch (error) {
        console.log(error.message);
    }
}

window.onload = async () => {
    try {
        const { email, fullName, phoneNumber } = await (await fetch("/api/me/info", { credentials: "include" })).json();
        if (!email) return;

        window.isUserLoggedIn = true;
        ["full-name", "email", "phone"].forEach((id, i) => {
            const field = document.getElementById(id);
            field && Object.assign(field, {
                value: [fullName, email, phoneNumber][i],
                disabled: true,
                classList: "blurred"
            });
        });
    } catch { console.error("User info fetch failed:", error) }
};