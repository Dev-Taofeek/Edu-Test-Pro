import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export const Toast = ({ message, type = "success", onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === "success" ? "bg-green-50" : "bg-red-50";
    const borderColor =
        type === "success" ? "border-green-500" : "border-red-500";
    const textColor = type === "success" ? "text-green-800" : "text-red-800";
    const Icon = type === "success" ? CheckCircle : XCircle;
    const iconColor = type === "success" ? "text-green-500" : "text-red-500";

    return (
        <div
            className={`fixed top-4 right-4 z-50 ${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg max-w-md animate-slide-in`}
        >
            <div className="flex items-start gap-3">
                <Icon className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />
                <p className={`${textColor} font-medium flex-1`}>{message}</p>
                <button
                    onClick={onClose}
                    className={`${textColor} hover:opacity-70 transition-opacity shrink-0`}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
