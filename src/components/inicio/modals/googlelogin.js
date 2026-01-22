import { useEffect } from "react";
import { API_URL } from "../../../config";

export default function LoginGoogle({ onSuccess }) {
    useEffect(() => {
        if (!window.google) return;

        google.accounts.id.initialize({
            client_id: "992388111982-a0hootauhov3044flkk0pr4ndtsqiug7.apps.googleusercontent.com",
            callback: async (response) => {
                const credential = response.credential;

                const resp = await fetch(`${API_URL}/das/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ credential })
                });

                const json = await resp.json();

                if (json.token) {
                    localStorage.setItem("token", json.token);
                    onSuccess?.();
                }
            }
        });

        google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large" }
        );
    }, []);

    return <div id="googleBtn"></div>;
}
