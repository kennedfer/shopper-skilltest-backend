const validators = require("../validators/request-validators");

// Função para mapear e validar objetos do SQL com base no corpo da requisição
const remapObject = (sqlResponse, requestBody) => {
  // Usamos o método map para criar um novo array com os objetos atualizados
  return sqlResponse.map((item) => {
    // Procuramos o novo preço no requestBody com base no código do item
    const newPrice = requestBody.find((entry) => entry[item.code]);

    // Se o novo preço não for encontrado, atribuímos um erro ao item
    if (!newPrice) {
      return { ...item, error: "Erro: Novo preço não encontrado" };
    }

    // Criamos uma cópia do item atualizado com o novo preço
    const updatedItem = { ...item, new_price: newPrice[item.code] };

    // Verificamos se o novo preço é menor que o custo e atribuímos um erro, se necessário
    if (validators.newPriceIsSmallerThanCost(updatedItem)) {
      return { ...updatedItem, error: "Erro: Preço menor que o custo" };
    }

    // Verificamos se a variação de preço é diferente e atribuímos um erro, se necessário
    if (validators.wrongPriceVariation(updatedItem)) {
      return { ...updatedItem, error: "Erro: Variação de preço diferente" };
    }

    // Retornamos o objeto atualizado
    return updatedItem;
  });
};

module.exports = { remapObject };
