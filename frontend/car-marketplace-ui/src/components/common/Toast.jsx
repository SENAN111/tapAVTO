
import { useEffect } from "react";

function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const isError = toast.type === "error";

    return (
        <div
            className={`app-toast ${isError ? "app-toast-error" : "app-toast-success"}`}
            role="status"
            aria-live="polite"
        >
            <div className="toast-icon">
                {isError ? "!" : "✓"}
            </div>

            <div className="toast-content">
                <strong>
                    {isError ? "Xəta baş verdi" : "Uğurlu əməliyyat"}
                </strong>
                <p>{toast.message}</p>
            </div>

            <button
                type="button"
                className="toast-close"
                onClick={onClose}
                aria-label="Bildirişi bağla"
            >
                ×
            </button>

            <div className="toast-progress" />
        </div>
    );
}

export default Toast;
