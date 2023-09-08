// Função para verificar se há um tipo de preço inválido no corpo da requisição
const hasAInvalidPriceType = (reqBody) =>
  reqBody.some((entry) => typeof Object.values(entry)[0] !== "number");

// Função para verificar se há uma chave inválida no corpo da requisição
const hasAInvalidKeyType = (reqBody) =>
  reqBody.some((entry) => isNaN(parseFloat(Object.keys(entry)[0])));

// Função para verificar se o resultado da consulta SQL está vazio
const hasAInvalidProductCode = (sqlResponse) => sqlResponse.length === 0;

// Função para verificar se o novo preço é menor que o preço de custo
const newPriceIsSmallerThanCost = (item) => item.new_price < item.cost_price;

// Função para verificar se a variação de preço está correta
const wrongPriceVariation = (item) => {
  const priceDifference = Math.abs(item.new_price - item.sales_price);
  const expectedVariation = Math.floor(item.sales_price / 10);

  return Math.floor(priceDifference) !== expectedVariation;
};

// Exporta as funções
module.exports = {
  hasAInvalidPriceType,
  hasAInvalidProductCode,
  newPriceIsSmallerThanCost,
  wrongPriceVariation,
  hasAInvalidKeyType,
};
