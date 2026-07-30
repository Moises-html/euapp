function showToast(message, type = "info") {
    const colors = {
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6"
    };

    const icons = {
        success: "✔",
        error: "✖",
        warning: "⚠",
        info: "ℹ"
    };

    Toastify({
        text: `${icons[type]}  ${message}`,
        duration: 3500,
        gravity: "top",
        position: "center",
        close: false,
        stopOnFocus: true,
        offset: {
            x: 20
        },
        style: {
            background: "#1F1F1F",
            color: "#FFFFFF",
            borderLeft: `5px solid ${colors[type]}`,
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,.35)",
            padding: "14px 18px",
            fontWeight: "500",
            fontSize: "14px"
        }
    }).showToast();
}

export function showSuccess(message) {
    showToast(message, "success");
}

export function showError(message) {
    showToast(message, "error");
}

export function showWarning(message) {
    showToast(message, "warning");
}

export function showInfo(message) {
    showToast(message, "info");
}