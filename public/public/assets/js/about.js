// async function restoreSession() {
//     try {
//         const response = await fetch("/api/session/restore", { credentials: "include" });
//         if (!response.ok) throw new Error("Session not found");

//         const data = await response.json();
//     } catch (error) {
//     }
// }

async function updateCartQuantity() {
    try {
        const res = await fetch("/api/myinfo");
        const cartJson = await res.json()
        document.getElementById("cart-quantity").textContent = Object.keys(cartJson.cart).length;

    } catch (err) {
        document.getElementById("cart-quantity").textContent = '0';
        console.error("Failed to get authenticated user:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    // await restoreSession();
    await updateCartQuantity();

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    document.querySelectorAll('.faq-section li').forEach((question) => {
        question.addEventListener('click', () => {
            const answer = question.children[1];

            document.querySelectorAll('.faq-section li p').forEach((otherAnswer) => {
                if (otherAnswer !== answer) {
                    otherAnswer.classList.remove('visible');
                    const plus_minus = otherAnswer.previousElementSibling.children[1];
                    plus_minus.style.transform = "rotate(0deg)";
                }
            });

            answer.classList.toggle('visible');
            const plus_minus = question.children[0].children[1];
            if (answer.classList.contains("visible")) {
                plus_minus.style.transform = "rotate(90deg)";
            } else {
                plus_minus.style.transform = "rotate(0deg)";
            }
        });
    });

    document.querySelectorAll('.faq-section li p').forEach((answer) => {
        answer.classList.remove('visible');
    });

    setTimeout(document.getElementById('loading-overlay').classList.add('fade-out'), 500);
});