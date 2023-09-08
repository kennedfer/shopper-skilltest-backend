// Importação dos módulos express e cors para criar o servidor web e configurar o CORS (Cross-Origin Resource Sharing).
const express = require("express");
const cors = require("cors");

// Importação das rotas definidas em um arquivo externo.
const routes = require("./routes/routes");

// Inicialização do aplicativo Express.
const app = express();

// Definição da origem permitida para CORS.
const allowedOrigin = "http://localhost:5173";

// Uso de middlewares para configurar o aplicativo Express.
// - express.json(): Permite que o aplicativo analise o corpo das solicitações no formato JSON.
app.use(express.json());

// - cors(): Configura o CORS para permitir solicitações vindas da origem 'allowedOrigin'.
//   - credentials: Habilita o uso de credenciais (por exemplo, cookies) em solicitações CORS.
//   - methods: Define os métodos HTTP permitidos (apenas POST neste caso).
//   - allowedHeaders: Define os cabeçalhos permitidos (apenas "Content-Type" neste caso).
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: "POST",
    allowedHeaders: "Content-Type",
  })
);

// Mapeamento de rotas para funções de controladores definidas em 'routes.js'.
// - Quando uma solicitação POST é feita para "/", a função 'sendProductsInfo' é chamada.
app.post("/", routes.sendProductsInfo);

// - Quando uma solicitação POST é feita para "/save", a função 'savePricesToDb' é chamada.
app.post("/save", routes.savePricesToDb);

// Inicialização do servidor, ouvindo na porta definida em 'process.env.PORT' ou na porta 3000 se não estiver definida.
app.listen(process.env.PORT || 3000, () => console.log("Server rodando..."));
