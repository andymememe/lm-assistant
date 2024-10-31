function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        endpoint: document.querySelector("#apiEndpoint").value,
        apikey: document.querySelector("#apiKey").value,
        model: document.querySelector("#model").value,
    });
}

function restoreOptions() {
    function setCurrentChoice(result) {
        console.log("Check", JSON.stringify(result))
        document.querySelector("#apiEndpoint").value = result.endpoint || "";
        document.querySelector("#apiKey").value = result.apikey || "";
        document.querySelector("#model").value = result.model || "";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get(["endpoint", "apikey", "model"]);
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("#submit").addEventListener("click", saveOptions);
