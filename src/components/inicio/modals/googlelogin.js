import { API_URL } from "../../../config";

export function iniciarGoogleLogin(callback) {
    /* global google */

    google.accounts.id.initialize({
        client_id: "992388111982-vbqmvlkoqh7u1mq4t6a83a944g1m15pa.apps.googleusercontent.com",
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
                callback(true);
            } else {
                callback(false);
            }
        }
    });


    google.accounts.id.prompt();
}
