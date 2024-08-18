const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./dados.db");

class Veiculo {
  constructor(ownerId, placa) {
    this.ownerId = ownerId;
    this.placa = placa;
  }

  static async GetVehiclesByOwner(ownerId) {
    try {
      const rows = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM veiculos WHERE OwnerID = ?", [ownerId], (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      });
      return rows;
    } catch (err) {
      console.error("Erro ao obter veículos do usuário:", err);
      throw new Error("Houve um erro ao buscar os veículos do usuário.");
    }
  }

  async GetVehName() {
    return await this._getField("Nome");
  }

  async GetVehModel() {
    return await this._getField("Modelo");
  }

  async GetVehDataBuy() {
    return await this._getField("DataCompra");
  }

  async GetVehSeguro() {
    return await this._getField("Seguro");
  }

  async GetVehPlaca() {
    return await this._getField("Placa");
  }

  async GetVehStatus() {
    return await this._getField("Status");
  }

  async GetChassi() {
    return await this._getField("Chassi");
  }

  

  async SetStatus(newStatus) {
    try {
      await this._runQuery("UPDATE veiculos SET Status = ? WHERE OwnerID = ? AND Placa = ?", [newStatus, this.ownerId, this.placa]);
      return "Status atualizado com sucesso.";
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      throw new Error("Houve um erro ao atualizar o status.");
    }
  }

  async SetSeguro(novoSeguro) {
    try {
      await this._runQuery("UPDATE veiculos SET Seguro = ? WHERE OwnerID = ? AND Placa = ?", [novoSeguro ? 1 : 0, this.ownerId, this.placa]);
      return "Seguro atualizado com sucesso.";
    } catch (err) {
      console.error("Erro ao atualizar seguro:", err);
      throw new Error("Houve um erro ao atualizar o seguro.");
    }
  }

  async SetChassi(novoChassi) {
    try {
      await this._runQuery("UPDATE veiculos SET Chassi = ? WHERE OwnerID = ? AND Placa = ?", [novoChassi, this.ownerId, this.placa]);
      return "Chassi atualizado com sucesso.";
    } catch (err) {
      console.error("Erro ao atualizar chassi:", err);
      throw new Error("Houve um erro ao atualizar o chassi.");
    }
  }
  async GetPlaca() {
    return await this.GetVehPlaca();
  }

  async GetStatus() {
    return await this.GetVehStatus();
  }

  async _getField(field) {
    try {
      const row = await this._getRow(`SELECT ${field} FROM veiculos WHERE OwnerID = ? AND Placa = ?`, [this.ownerId, this.placa]);
      return row ? row[field] : null;
    } catch (err) {
      console.error(`Erro ao obter ${field}:`, err);
      throw err;
    }
  }

  _getRow(query, params) {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  _runQuery(query, params) {
    return new Promise((resolve, reject) => {
      db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve(this);
      });
    });
  }
}

// Função para gerar uma placa única
async function gerarPlaca() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";

  let placa;
  let exists = true;

  while (exists) {
    placa = "";

    // Gerar quatro letras
    for (let i = 0; i < 4; i++) {
      placa += letras.charAt(Math.floor(Math.random() * letras.length));
    }

    // Gerar três números
    for (let i = 0; i < 3; i++) {
      placa += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }

    exists = await checkExists('placa', placa);
  }

  return placa;
}

// Função para gerar um chassi único
async function gerarChassi() {
  const numeros = "0123456789";

  let chassi;
  let exists = true;

  while (exists) {
    chassi = "";

    // Gerar sete números
    for (let i = 0; i < 7; i++) {
      chassi += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }

    exists = await checkExists('chassi', chassi);
  }

  return chassi;
}

// Função auxiliar para verificar se um valor existe no banco de dados
function checkExists(column, value) {
  return new Promise((resolve, reject) => {
    const query = `SELECT COUNT(*) AS count FROM veiculos WHERE ${column} = ?`;
    db.get(query, [value], (err, row) => {
      if (err) return reject(err);
      resolve(row.count > 0);
    });
  });
}

// Função para dar veículo
async function DarVeiculo(ownerId, nome, modelo, dataCompra, seguro, placa, status, chassi) {
  try {
    const query = `INSERT INTO veiculos (OwnerID, Nome, Modelo, DataCompra, Seguro, Placa, Status, Chassi) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [ownerId, nome, modelo, dataCompra, seguro ? 1 : 0, placa, status, chassi];
    await runQuery(query, params);
    return "Veículo adicionado com sucesso.";
  } catch (err) {
    console.error("Erro ao adicionar veículo:", err);
    throw new Error("Houve um erro ao adicionar o veículo.");
  }
}

// Função para remover veículo
async function RemoverVeiculo(ownerId, placa) {
  try {
    const query = "DELETE FROM veiculos WHERE OwnerID = ? AND Placa = ?";
    const params = [ownerId, placa];
    await runQuery(query, params);
    return "Veículo removido com sucesso.";
  } catch (err) {
    console.error("Erro ao remover veículo:", err);
    throw new Error("Houve um erro ao remover o veículo.");
  }
}

// Função auxiliar para executar consultas
function runQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Função para Buscar dados de veiculo
function BuscarVeh(coluna, valor) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM veiculos WHERE ${coluna} = ?`;
    db.all(query, [valor], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = { Veiculo, gerarChassi, gerarPlaca, DarVeiculo, RemoverVeiculo, BuscarVeh };
