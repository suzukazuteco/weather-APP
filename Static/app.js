const loginView = document.getElementById("Login");
const weatherApp = document.getElementById("WeatherApp");
const loginButton = document.getElementById("getLoginData");
const registerButton = document.getElementById("getRegisterData");
const dropdown = document.getElementById("areaDropdown");
const areaTrigger = document.getElementById("areaTrigger");
const areaTriggerLabel = document.getElementById("areaTriggerLabel");
const areaOptions = document.getElementById("areaOptions");
const getWeatherButton = document.getElementById("getWeatherBtn");
const weatherResult = document.getElementById("weatherResult");
const loginErrorMessage = document.getElementById("loginErrorMessage");
const registerErrorMessage = document.getElementById("registerErrorMessage");
const registerSuccessMessage = document.getElementById("registerSuccessMessage");
const weatherErrorMessage = document.getElementById("weatherErrorMessage");
const logoutButton = document.getElementById("logoutButtun");

let selectedAreaCode = "";
let selectedWeatherData = null;

function showError(message, scope = "login") {
    const errorMessage = scope === "weather"
        ? weatherErrorMessage
        : scope === "register"
            ? registerErrorMessage
            : loginErrorMessage;

    errorMessage.textContent = message;
    errorMessage.classList.remove("d-none");
}

function showRegisterSuccess(message) {
    registerSuccessMessage.textContent = message;
    registerSuccessMessage.classList.remove("d-none");
}

function clearError(scope) {
    const messages = scope
        ? [scope === "weather"
            ? weatherErrorMessage
            : scope === "register"
                ? registerErrorMessage
                : loginErrorMessage]
        : [loginErrorMessage, registerErrorMessage, weatherErrorMessage];

    messages.forEach((errorMessage) => {
        errorMessage.textContent = "";
        errorMessage.classList.add("d-none");
    });

    if (!scope || scope === "register") {
        registerSuccessMessage.textContent = "";
        registerSuccessMessage.classList.add("d-none");
    }
}

function showWeatherApp() {
    weatherApp.style.display = "grid";
    loginView.style.display = "none";
}

function showLoginApp() {
    loginView.style.display = "grid";
    weatherApp.style.display = "none";
}

function openDropdown() {
    dropdown.classList.add("is-open");
    areaOptions.classList.remove("d-none");
    areaTrigger.setAttribute("aria-expanded", "true");
}

function closeDropdown() {
    dropdown.classList.remove("is-open");
    areaOptions.classList.add("d-none");
    areaTrigger.setAttribute("aria-expanded", "false");
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
            </div>
        </article>
    `;
}

function updateSelectedOption() {
    const options = areaOptions.querySelectorAll(".select-option");

    options.forEach((option) => {
        const isSelected = option.dataset.code === selectedAreaCode;
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-selected", String(isSelected));
    });
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
    clearError("login");

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
        showError(error.message, "login");
    }
}

async function onRegisterClick() {
    clearError("register");

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

        const data = await handleJsonResponse(response);
        showRegisterSuccess(data.message || "新規登録が完了しました");

        setTimeout(() => {
            location.replace(location.href);
        }, 1200);
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message, "register");
    }
}

function selectArea(code, name) {
    selectedAreaCode = code;
    selectedWeatherData = null;
    areaTriggerLabel.textContent = name;
    updateSelectedOption();
    clearError("weather");
    closeDropdown();

    if (selectedAreaCode) {
        preloadWeather(selectedAreaCode);
    }
}

async function loadAreas() {
    try {
        const response = await fetch("/api/areas");
        const data = await handleJsonResponse(response);

        data.forEach((area) => {
            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "select-option";
            optionButton.dataset.code = area.code;
            optionButton.role = "option";
            optionButton.setAttribute("aria-selected", "false");
            optionButton.textContent = area.name;
            optionButton.addEventListener("click", () => selectArea(area.code, area.name));
            areaOptions.appendChild(optionButton);
        });
    } catch (error) {
        console.error("エラー:", error.message);
        showError(error.message, "weather");
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
        showError("地域を選択してください", "weather");
        return;
    }

    clearError("weather");

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
        showError(error.message, "weather");
    }
}

async function onLogoutClick() {
    clearError("weather");

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
        showError(error.message, "weather");
    }
}

function onTriggerClick() {
    if (dropdown.classList.contains("is-open")) {
        closeDropdown();
        return;
    }

    openDropdown();
}

function onDocumentClick(event) {
    if (!dropdown.contains(event.target)) {
        closeDropdown();
    }
}

function onDocumentKeydown(event) {
    if (event.key === "Escape") {
        closeDropdown();
        areaTrigger.focus();
    }
}

loginButton.addEventListener("click", onLoginClick);
registerButton.addEventListener("click", onRegisterClick);
areaTrigger.addEventListener("click", onTriggerClick);
getWeatherButton.addEventListener("click", onGetWeatherClick);
logoutButton.addEventListener("click", onLogoutClick);
document.addEventListener("click", onDocumentClick);
document.addEventListener("keydown", onDocumentKeydown);

await checkSession();
await loadAreas();
