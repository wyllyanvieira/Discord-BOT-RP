const sqlite3 = require("sqlite3");
const config = require("./Configs/config.json");
const configitems = require("./Configs/items.json");
const db = new sqlite3.Database("./dados.db");
const Discord = require('discord.js')
class Usuario {
  constructor(userId) {
    this.userId = userId;
  }

  async banco() {
    try {
      const row = await this._getRow("SELECT banco FROM users WHERE user_id = ?", [this.userId]);
      return row ? row.banco : 0;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async carteira() {
    try {
      const row = await this._getRow("SELECT carteira FROM users WHERE user_id = ?", [this.userId]);
      return row ? row.carteira : 0;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async inventario() {
    try {
      const row = await this._getRow("SELECT inventory FROM users WHERE user_id = ?", [this.userId]);
      return row ? JSON.parse(row.inventory) : {};
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async capacidade() {
    try {
      const row = await this._getRow("SELECT capacity FROM users WHERE user_id = ?", [this.userId]);
      if (!row) {
        throw new Error("Usuário não encontrado.");
      }
      return row.capacity;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async setCapacidade(newCapacity) {
    try {
      await this._runQuery("UPDATE users SET capacity = ? WHERE user_id = ?", [newCapacity, this.userId]);
      return "Capacidade atualizada com sucesso.";
    } catch (err) {
      console.error("Erro ao definir a capacidade:", err);
      throw new Error("Houve um erro ao definir a capacidade.");
    }
  }

  async GiveMoney(amount) {
    try {
      await this._runQuery("UPDATE users SET carteira = carteira + ? WHERE user_id = ?", [amount, this.userId]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async TakeMoney(amount) {
    try {
      await this._runQuery("UPDATE users SET carteira = carteira - ? WHERE user_id = ?", [amount, this.userId]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async WithdrawMoney(amount) {
    try {
      await this._runQuery(
        "UPDATE users SET banco = banco - ?, carteira = carteira + ? WHERE user_id = ?",
        [amount, amount, this.userId]
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async DepositMoney(amount) {
    try {
      await this._runQuery(
        "UPDATE users SET banco = banco + ?, carteira = carteira - ? WHERE user_id = ?",
        [amount, amount, this.userId]
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async GetItem(itemId) {
    const inventory = await this.inventario();
    const quantity = inventory[itemId] || 0;
    return { item_id: itemId, quantity };
  }

  async GiveItem(itemId, quantity) {
    const item = configitems.items.find((item) => item.id === parseInt(itemId));
    if (!item) return "Item desconhecido.";

    const inventory = await this.inventario();
    inventory[itemId] = (inventory[itemId] || 0) + quantity;

    try {
      await this._runQuery("UPDATE users SET inventory = ? WHERE user_id = ?", [JSON.stringify(inventory), this.userId]);
      return `Você adicionou ${inventory[itemId]} ${item.name}(s).`;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async TakeItem(itemId, quantity) {
    const item = configitems.items.find((item) => item.id === parseInt(itemId));
    if (!item) return "Item desconhecido.";

    const currentItem = await this.GetItem(itemId);

    if (!currentItem || currentItem.quantity < quantity) {
      return "Quantidade insuficiente ou item não encontrado.";
    }

    const inventory = await this.inventario();
    if (inventory[itemId] > quantity) {
      inventory[itemId] -= quantity;
    } else {
      delete inventory[itemId];
    }

    try {
      await this._runQuery("UPDATE users SET inventory = ? WHERE user_id = ?", [JSON.stringify(inventory), this.userId]);
      return (inventory[itemId] > 0
        ? `Você removeu ${inventory[itemId]} ${item.name}(s).`
        : `Não possui ${item.name}(s) no inventário.`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  
  async hasItems(itemsRequired) {
    const inventory = await this.inventario();
    for (const item of itemsRequired) {
      if (!inventory[item.id] || inventory[item.id] < item.quantity) {
        return false;
      }
    }
    return true;
  }

  async useItems(itemsRequired) {
    const inventory = await this.inventario();
    for (const item of itemsRequired) {
      if (inventory[item.id] >= item.quantity) {
        inventory[item.id] -= item.quantity;
        if (inventory[item.id] === 0) {
          delete inventory[item.id];
        }
      }
    }
    try {
      await this._runQuery("UPDATE users SET inventory = ? WHERE user_id = ?", [JSON.stringify(inventory), this.userId]);
    } catch (err) {
      console.error(err);
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
      db.run(query, params, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

// Função para obter o nome do item
const GetItemName = (itemId) => {
  const item = configitems.items.find((item) => item.id === parseInt(itemId));
  return item ? item.name : "Item desconhecido";
};

async function InicializarUsuario(userId) {
  try {
    const row = await getRow("SELECT 1 FROM users WHERE user_id = ?", [userId]);
    if (!row) {
      await runQuery(
        "INSERT INTO users (user_id) VALUES (?)",
        [userId]
      );
    }
  } catch (err) {
    console.error("Erro ao inicializar o usuário:", err);
    throw err;
  }
}
function getRow(query, params) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function runQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function EnviarLogEmprego(channelId, mensagem, prova, client, usuario, valor) {
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    console.error("Canal não encontrado!");
    return;
  }

  const row = new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`jobaprovar_${valor}_${usuario.id}`)
        .setLabel('Aprovar')
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setCustomId(`jobreprovar_${valor}_${usuario.id}`)
        .setLabel('Reprovar')
        .setStyle(Discord.ButtonStyle.Danger)
    );

  const embed = new Discord.EmbedBuilder()
    .setColor(config.embedColor)
    .setDescription(mensagem)
    .setTitle("Log de Prova de Trabalho")
    .setImage(prova || null);

  await channel.send({ embeds: [embed], components: [row] });
}

module.exports = {
  Usuario,
  InicializarUsuario,
  GetItemName,
  EnviarLogEmprego,
};
