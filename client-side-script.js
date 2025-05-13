// apps/client/client-side-script.js

// Establish a WebSocket connection to the server
const socket = new WebSocket("ws://localhost:5000");

// Event handler when WebSocket is opened
socket.onopen = function () {
    console.log("Connected to WebSocket server");
};

// Event handler when a message is received from the server
socket.onmessage = function (event) {
    const message = JSON.parse(event.data);
    console.log("Received message:", message);
};

// Listen for input field changes and send the input data to the server
document.getElementById("inputField").addEventListener("input", function (e) {
    const inputValue = e.target.value;

    // Send the input value to the server (only if it’s non-empty)
    if (inputValue && inputValue.trim() !== "") {
        socket.send(JSON.stringify({ type: "input", input: inputValue }));
    }
});
