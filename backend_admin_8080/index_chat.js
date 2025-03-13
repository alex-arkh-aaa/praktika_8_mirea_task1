const connection = new WebSocket("ws://localhost:3000");
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
connection.onmessage = (event) =>{ 
    message = document.createElement('p');
    message.textContent = "Сервер говорит: " + event.data;
    document.getElementById('textArea').append(message);
    console.log("Server response:", event.data);
};
function sendMessage(){
    text = document.getElementById('messageArea').value;
    if (text == ""){
        alert("Пожалуйста, введите непустую строку")
    }
    else {
        message = document.createElement('p');
        connection.send(text);
        message.textContent = "Клиент говорит: " + text;
        document.getElementById('textArea').append(message);
    }
};