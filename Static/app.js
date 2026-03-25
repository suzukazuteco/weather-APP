const loginView = document.getElementById("Login");
const weatherApp = document.getElementById("WeatherApp");
const loginButton = document.getElementById("getLoginData");
const registerButton = document.getElementById("getRegisterData");
const areaSelect = document.getElementById("areaSelect");
const getWeatherButton = document.getElementById("getWeatherBtn");
const weatherResult = document.getElementById("weatherResult");
const errorMessage = document.getElementById("errorMessage");
const logoutButton = document.getElementById("logoutButtun");

let selectedAreaCode = "";
let selectedWeatherData = null;

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("d-none");
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("d-none");
}

function showWeatherApp() {
    weatherApp.style.display = "grid";
    loginView.style.display = "none";
}

function showLoginApp() {
    loginView.style.display = "grid";
    weatherApp.style.display = "none";
}

function renderWeather(areaData) {
    weatherResult.innerHTML = `
        <article class="forecast-card">
            <div>
                <p class="forecast-label">Today's Forecast</p>
                <h3>${areaData.areaname}</h3>
            </div>
            <p class="forecast-weather">${areaData.weather}</p>
            <div class="forecast-meta">
                <span class="meta-chip">最高気温 ${areaData.maxtemps}</span>
                <span class="meta-chip">地域コード ${selectedAreaCode}</span>
            </div>
        </article>
    `;
}

async function handleJsonResponse(response) {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
    }

    return response.json();
}

async function checkSession() {
    try {
        const response = await fetch("/api/me");
        if (response.ok) {
            showWeatherApp();
            return;
        }
    } catch (error) {
        console.error("エラー:", error.message);
    }

    showLoginApp();
}

async function onLoginClick() {
    clearError();

    const usernameInput = document.getElementById("login_username");
    const passwordInput = document.getElementById("login_password");
    const loginData = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        await handleJsonResponse(response);
        location.replace(location.href);
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message);
    }
}

async function onRegisterClick() {
    clearError();

    const usernameInput = document.getElementById("register_username");
    const passwordInput = document.getElementById("register_password");
    const registerData = {
        username: usernameInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerData)
        });

        await handleJsonResponse(response);
        location.replace(location.href);
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message);
    }
}

async function loadAreas() {
    try {
        const response = await fetch("/api/areas");
        const data = await handleJsonResponse(response);

        data.forEach((area) => {
            const option = document.createElement("option");
            option.value = area.code;
            option.textContent = area.name;
            areaSelect.appendChild(option);
        });
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message);
    }
}

function onAreaChange(event) {
    selectedAreaCode = event.target.value;
    selectedWeatherData = null;
    clearError();

    if (selectedAreaCode) {
        preloadWeather(selectedAreaCode);
    }
}

async function preloadWeather(areaCode) {
    try {
        const response = await fetch(`/api/weather/${areaCode}`);
        const areaData = await handleJsonResponse(response);

        if (selectedAreaCode === areaCode) {
            selectedWeatherData = areaData;
        }
    } catch (error) {
        console.error("エラー:", error.message);
    }
}

async function onGetWeatherClick() {
    if (!selectedAreaCode) {
        showError("地域を選択してください");
        return;
    }

    clearError();

    try {
        if (!selectedWeatherData) {
            await preloadWeather(selectedAreaCode);
        }

        if (!selectedWeatherData) {
            throw new Error("天気情報の取得に失敗しました");
        }

        renderWeather(selectedWeatherData);
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message);
    }
}

async function onLogoutClick() {
    clearError();

    try {
        const response = await fetch("/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        await handleJsonResponse(response);
        location.reload();
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message);
    }
}

loginButton.addEventListener("click", onLoginClick);
registerButton.addEventListener("click", onRegisterClick);
areaSelect.addEventListener("change", onAreaChange);
getWeatherButton.addEventListener("click", onGetWeatherClick);
logoutButton.addEventListener("click", onLogoutClick);

await checkSession();
await loadAreas();
