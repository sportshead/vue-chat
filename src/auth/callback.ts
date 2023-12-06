console.log(window.location.hash);
const params = new URLSearchParams(window.location.hash.slice(1));
console.log(params);

localStorage.setItem(
    "auth_callback_session",
    JSON.stringify({
        refresh_token: params.get("refresh_token")!,
        access_token: params.get("access_token")!,
    }),
);
window.close();
