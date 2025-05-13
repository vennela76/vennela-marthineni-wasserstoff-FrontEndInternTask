// client.js (client-side)

// Establish WebSocket connection to the server
const socket = new WebSocket("ws://localhost:5000");

socket.onopen = function () {
    console.log("Connected to WebSocket server");
};

socket.onmessage = function (event) {
    const message = JSON.parse(event.data);
    console.log("Received message:", message);

    // Handle the incoming message (e.g., update UI)
};

// When input field value changes, send data to the server
document.getElementById("inputField").addEventListener("input", function (e) {
    const inputValue = e.target.value;

    // Send input data to the server if it's not empty
    if (inputValue) {
        socket.send(JSON.stringify({ type: "input", input: inputValue }));
    }
});
