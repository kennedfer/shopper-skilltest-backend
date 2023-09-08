// Importa as bibliotecas necessárias
const mysql = require("mysql2/promise");
const utils = require("../utils/utils");
const validators = require("../validators/request-validators");

// Configurações do banco de dados
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "mydb",
  port: 3306,
};

// Cria um pool de conexão com o banco de dados
const pool = mysql.createPool(dbConfig);

// Função assíncrona para lidar com a requisição de envio de informações de produtos
async function sendProductsInfo(req, res) {
  try {
    const reqBody = req.body;

    // Ordena o corpo da requisição com base nas chaves dos objetos
    reqBody.sort((a, b) => Object.keys(a)[0] - Object.keys(b)[0]);

    // Verifica se há chaves inválidas no corpo da requisição
    if (validators.hasAInvalidKeyType(reqBody))
      return res.status(400).send("Tipo de dado errado no campo 'Código'");

    // Obtém os códigos dos produtos a partir do corpo da requisição
    const codes = reqBody.map((obj) => Object.keys(obj));

    // Consulta o banco de dados para obter informações dos produtos com os códigos fornecidos
    const sqlResults = await pool.query(
      `SELECT * FROM products WHERE code IN (${codes})`
    );

    // Verifica se há tipos de preço inválidos no corpo da requisição
    if (validators.hasAInvalidPriceType(reqBody))
      return res.status(400).send("Tipo de dado errado no campo 'Novo Preço'");

    // Verifica se há códigos de produtos desconhecidos
    if (validators.hasAInvalidProductCode(sqlResults[0]))
      return res.status(400).send("Um ou mais códigos desconhecido(s)");

    // Formata os dados retornados do banco de dados de acordo com o corpo da requisição
    const objectFormated = utils.remapObject(
      JSON.parse(JSON.stringify(sqlResults[0])),
      reqBody
    );

    // Envia os dados formatados como resposta
    res.send(objectFormated);
  } catch (error) {
    // Em caso de erro, registra o erro no console e envia uma resposta de erro
    res.status(500).send("Erro interno do servidor");
  }
}

// Função assíncrona para salvar os preços no banco de dados
async function savePricesToDb(req, res) {
  try {
    const products = req.body;

    // Itera sobre os produtos no corpo da requisição
    for (const product of products) {
      // Atualiza o preço de venda do produto no banco de dados
      const result = await pool.query(
        `UPDATE products SET sales_price = ? WHERE code = ?`,
        [product["new_price"], product.code]
      );

      // Consulta todos os pacotes que contêm o produto
      const allPacks = (
        await pool.query(
          `SELECT * FROM packs WHERE product_id = ?`,
          product.code
        )
      )[0];

      // Se não houver pacotes, envia uma resposta de sucesso
      if (allPacks.length === 0) {
        res.send({ msg: "Salvo!" });
      }

      // Itera sobre os pacotes
      for (const pack of allPacks) {
        // Consulta todos os pacotes com o mesmo ID
        const allPackOfSameId = (
          await pool.query(
            `SELECT * FROM packs WHERE pack_id = ?`,
            pack["pack_id"]
          )
        )[0];

        // Se houver pacotes com o mesmo ID, calcula o novo preço do pacote
        if (allPackOfSameId.length > 0) {
          let newPrice = 0;

          for (const pack of allPackOfSameId) {
            // Consulta o preço do produto no pacote
            const product = (
              await pool.query(
                `SELECT * FROM products WHERE code = ?`,
                pack["product_id"]
              )
            )[0][0];

            // Calcula o novo preço do pacote
            newPrice += product.sales_price * pack.qty;
          }

          // Atualiza o preço de custo do pacote no banco de dados
          await pool.query(
            `UPDATE products SET cost_price = ? WHERE code = ?`,
            [newPrice, pack.pack_id]
          );

          // Envie uma resposta de sucesso com uma mensagem
          res.send({ msg: "Salvo com mudanças em um ou mais pacotes" });
        }
      }
    }
  } catch (error) {
    // Em caso de erro, registra o erro no console e envia uma resposta de erro
    res.status(500).send("Erro interno do servidor");
  }
}

// Exporta as funções para uso em outros módulos
module.exports = { sendProductsInfo, savePricesToDb };
