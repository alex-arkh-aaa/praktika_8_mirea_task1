const connection = new WebSocket("ws://localhost:8080"); //  Важно: поменяйте порт на 3000, т.к. у вас один порт для всего
// если соединение успешно установлено
connection.onopen = (event) => {
    console.log("Connection opened");
    connection.send("Hello Server");
};
// если возникла ошибка
connection.onerror = (error) => {
    console.log(`WebSocket Error: ${error}`);
};
// если соединение закрыто
connection.onclose = (event) => {
    console.log("Connection closed");
};
// получаем ответ сервера
connection.onmessage = (event) => {
    const message = document.createElement('p');
    message.textContent = "Сервер говорит: " + event.data;
    document.getElementById('textArea').append(message);
    console.log("Server response:", event.data);
};
function sendMessage() {
    const text = document.getElementById('messageArea').value;
    if (text == "") {
        alert("Пожалуйста, введите непустую строку")
    }
    else {
        const message = document.createElement('p');
        connection.send(text);
        message.textContent = "Клиент говорит: " + text;
        document.getElementById('textArea').append(message);
    }
};