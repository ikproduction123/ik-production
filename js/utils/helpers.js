// Format Angka ke Rupiah IDR
export function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(amount);
}

// Format Tanggal untuk Undangan (12.12.27)
export function formatDateShort(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
}

// Toast Notification
export function showToast(message, type = "success") {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.style.cssText =
            "position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    const bgColor =
        type === "success"
            ? "#1B4332"
            : type === "error"
              ? "#D32F2F"
              : "#E65100";
    toast.style.cssText = `background:${bgColor};color:#FFF8E7;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:sans-serif;font-size:14px;transition:all 0.3s ease;`;
    toast.innerText = message;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
