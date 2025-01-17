var response = document.getElementById("response");
const decoder = new TextDecoder("utf-8");

document.getElementById("summary").addEventListener('click', function() {
    response.textContent = "Thinking...";
    getHightlighted()
        .then(text => {
            queryGPT("\u8acb\u5c07\u4ee5\u4e0b\u6587\u7ae0\u7684\u91cd\u9ede\u6574\u7406\u6210\u4e2d\u6587\u689d\u5217\u91cd\u9ede\uff0c\u4e26\u4e14\u6bcf\u500b\u91cd\u9ede\u90fd\u7c21\u77ed\u5448\u73fe\uff0c\u4e0d\u8981\u6709\u904e\u591a\u7684\u5197\u9918\u8d05\u5b57:\n" + text)
            .then(reader => {
                readStream(reader).then(null, error => {
                    response.textContent = error;
                });
            }, error => {
                response.textContent = error;
            });
        });
});

document.getElementById("define").addEventListener('click', function() {
    response.textContent = "Thinking...";
    getHightlighted()
    .then(text => {
        queryGPT("\u8acb\u7528\u4e2d\u6587\u5b9a\u7fa9\u4ee5\u4e0b\u8a5e\u5f59\u6216\u7247\u8a9e\uff0c\u8acb\u5982\u8fad\u5178\u4e00\u822c\u56de\u7b54\u800c\u975e\u76f4\u63a5\u7ffb\u8b6f:\n" + text)
        .then(reader => {
            readStream(reader).then(null, error => {
                response.textContent = error;
            });
        }, error => {
            response.textContent = error;
        });
    });
});

document.getElementById("translate").addEventListener('click', function() {
    response.textContent = "Thinking...";
    getHightlighted()
    .then(text => {
        queryGPT("\u8acb\u5c07\u4ee5\u4e0b\u6587\u5b57\u7ffb\u8b6f\u6210\u4e2d\u6587\uff0c\u4e0d\u8981\u505a\u4efb\u4f55\u8d85\u8b6f\u548c\u89e3\u91cb:\n" + text)
        .then(reader => {
            readStream(reader).then(null, error => {
                response.textContent = error;
            });
        }, error => {
            response.textContent = error;
        });
    });
});

document.getElementById("ask").addEventListener('click', function() {
    response.textContent = "Thinking...";
    getHightlighted()
    .then(text => {
        let quest = document.getElementById('question').value;
        queryGPT(quest + "\uff0c\u8acb\u53c3\u8003\u4ee5\u4e0b\u6587\u5b57\u505a\u56de\u61c9\uff0c\u4e0d\u8981\u7528\u5176\u4ed6\u8cc7\u6599\u4f86\u505a\u53c3\u8003:\n" + text)
        .then(reader => {
            readStream(reader).then(null, error => {
                response.textContent = error;
            });
        }, error => {
            response.textContent = error;
        });
    });
});

async function readStream(reader) {
    response.textContent = "";
    while(true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        const text = decoder.decode(value);
        const lines = text.split("\n");

        lines.forEach(line => {
            if (line.startsWith("data:")) {
                const jsonString = line.replace(/^data:\s*/, "")
                if (jsonString === "[DONE]") return;

                try {
                    const jsonData = JSON.parse(jsonString);
                    const content = jsonData.choices[0].delta.content;
                    // Check if content is not undefined
                    if (content!== undefined) {
                        response.textContent += content;
                    }
                } catch (error) {
                    throw error;
                }
            }
        });
    }
    return;
}

function getHightlighted() {
    const sending = browser.runtime.sendMessage(
        {action: "getHightlighted"}
    )
    let res = sending.then(response => {
            return response.highlighted;
        }, _ => { return ""; });
    
    return res;
}

function readBrowserStorage() {
    function onError(error) {
        console.log(`Error: ${error}`);
        return;
    }

    function onGot(item) {
        return item;
    }

    const getting = browser.storage.sync.get(["endpoint", "apikey", "model"]);
    return getting.then(onGot, onError);
}

function queryGPT(prompt) {
    // Fetch the required values from browser storage 
    const storageValues = readBrowserStorage();
    
    return storageValues.then(res => {
        if (!res) {
            return new Error("No response");
        }

        // Extract endpoint, apikey and model from the response object
        console.log(res)
        let endpoint = res["endpoint"];
        let apikey = res["apikey"];
        let model = res["model"];

        // Check if endpoint is empty
        if (!endpoint || endpoint.trim() === "") {
            throw new Error("Please setup endpoint in setting page");
        }

        // Create the body for fetch request
        let body = {
            messages: [{
                role: "user",
                content: prompt
            }],
            stream: true
        };
        let headers = {
            'Content-Type': 'application/json; charset=utf-8'
        }
        
        // Check if apikey is not empty
        if (apikey && apikey.trim() !== "") {
            headers["Authorization"] = `Bearer ${apikey}`;
        }
        
        // Check if apikey is not empty
        if (model && model.trim() !== "") {
            body["model"] = model;
        }

        // Define headers for fetch request
        const options = { 
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        };
  
        // Fetch request to the OpenAI API endpoint
        return fetch(endpoint, options).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.body.getReader();
        }, error => {
            throw error;
        });
    });
}