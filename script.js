const token = "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";
const inputTxt = document.getElementById("input");
const image = document.getElementById("image");
const button = document.getElementById("btn");
const modelSelect = document.getElementById("model-select"); // Reference to model selection dropdown
const downloadButton = document.getElementById("download-btn");

// Input width expansion logic
inputTxt.addEventListener('input', function() {
    const tempSpan = document.createElement('span');
    tempSpan.style.fontSize = window.getComputedStyle(inputTxt).fontSize;
    tempSpan.style.fontFamily = window.getComputedStyle(inputTxt).fontFamily;
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.textContent = inputTxt.value || inputTxt.placeholder;

    document.body.appendChild(tempSpan);

    const newWidth = Math.min(tempSpan.offsetWidth + 30, window.innerWidth * 0.9);
    inputTxt.style.width = `${newWidth}px`;

    document.body.removeChild(tempSpan);
});

// Function to choose model based on the dropdown selection
function getModelURL() {
    const selectedModel = modelSelect.value;
    if (selectedModel === "beta") {
        return "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";
    } else {
        return "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
    }
}

// Function to send query to the selected model API
async function query() {
    const modelURL = getModelURL(); // Get the appropriate model URL

    try {
        const response = await fetch(modelURL, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                "inputs": inputTxt.value,  // input text from user
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.json(); // Get error details from response
            throw new Error(`Error ${response.status}: ${errorDetails.error || response.statusText}`);
        }

        const result = await response.blob();
        return result;
    } catch (error) {
        console.error("API request failed:", error);
        alert(`Failed to generate image: ${error.message}`);
    }
}

// Function to clear the existing image and download button
function clearImageAndDownload() {
    image.src = ""; // Clear the existing image
    downloadButton.style.display = 'none'; // Hide the download button
}

// Handle button click event
button.addEventListener('click', async function() {
    clearImageAndDownload(); // Clear any existing image and button before generating a new one
    image.src = "loading.gif"; // Show a loading image (you should have a loading.gif for this)
    const text = inputTxt.value.trim();

    if (!text) {
        alert("Please enter some text!");
        return;
    }

    query().then((response) => {
        const objectURL = URL.createObjectURL(response);
        image.src = objectURL; // Load the generated image once fetched

        // Make the download button visible
        downloadButton.style.display = 'block';

        // Add functionality to download the image
        downloadButton.onclick = function() {
            const link = document.createElement('a');
            link.href = objectURL; // Set the URL of the image
            link.download = 'generated-image.png'; // Set the default download name
            link.click(); // Trigger the download
        };
    }).catch((error) => {
        console.error("Error during image fetch:", error);
    });
});

// Clear image and download button when model is changed
modelSelect.addEventListener('change', function() {
    clearImageAndDownload(); // Clear existing image and button when the model is changed
});
