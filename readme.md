
# Roleplay Discord Bot para Xbox e PlayStation

Bem-vindo ao projeto do **Roleplay Discord Bot**! Este bot foi desenvolvido para jogadores de **Xbox e PlayStation** que desejam criar e gerenciar uma cidade de roleplay em suas plataformas. Ele facilita a gestão dos jogadores e suas atividades, oferecendo funcionalidades essenciais para um roleplay organizado, mesmo sem a possibilidade de modificações de scripts como no FiveM. Utilizei este projeto para iniciar meus estudos sobre POO (Programação Orientada a Objetos). Estou disponibilizando o bot para aqueles que têm interesse em abrir seus servidores de roleplay em plataformas que não possuem suporte às tecnologias mencionadas anteriormente.

Se você deseja um bot personalizado com alguma modificação, entre em contato comigo no Discord: **@wyllyan.br**

## Funcionalidades

- **Sistema de Whitelist**: Criação de canais dedicados para cada jogador, onde serão feitas perguntas de múltipla escolha e perguntas abertas para avaliação dos candidatos.
- **Gerenciamento de Personagens**: Registro de personagens dos jogadores, incluindo informações como nome, idade e ocupação.
- **Sistema de Economia Simples**: Gestão de dinheiro virtual e transações entre jogadores.
- **Controle de Ocorrências**: Registro de incidentes e atividades de roleplay.
- **Sistema de Aplicação de Regras**: Ferramentas para aplicar regras e penalidades aos jogadores que não seguirem as normas.
- **Notificações**: Envio de notificações automáticas sobre eventos, atualizações e avisos importantes.
- **Suporte Multiplataforma**: Operacional no Discord, onde jogadores de Xbox e PlayStation podem interagir e gerenciar suas atividades de roleplay.

## Comandos Disponíveis

### Comandos de Economia

#### Balance
- `/saldo`: Mostra o saldo do usuário que executa o comando.
- `/saldo @user`: Mostra o saldo de outro membro mencionado.

#### Add/Remove Money (Admin)
- `/adicionar-dinheiro @user <amount>`: Adiciona dinheiro ao saldo de um membro (Admin).
- `/remover-dinheiro @user <amount>`: Remove dinheiro do saldo de um membro (Admin).

#### Dep/With Money
- `/depositar <amount>`: Deposita dinheiro do saldo para o banco.
- `/sacar <amount>`: Saca dinheiro do banco para o saldo.

#### Pay
- (Em Desenvolvimento) `/pagar @user <amount>`: Transfere dinheiro do saldo do usuário para outro membro.

### Comandos de Inventário

#### Inventários
- `/inventario`: Mostra o inventário do usuário que executa o comando.
- `/revistar @user`: Mostra o inventário de outro membro mencionado.

#### Shop
- `/setarloja`: Configura um canal onde os usuários podem comprar itens.

#### Give/Take Item (Admin)
- `/giveitem @user <item_name>`: Adiciona um item ao inventário de um membro (Admin).
- `/takeitem @user <item_name>`: Remove um item do inventário de um membro (Admin).

### Comandos de Garagem

#### Garagem
- `/garagem`: Mostra a garagem do usuário que executa o comando.

#### Concessionária
- `/concessionaria`: Mostra os carros disponíveis para compra no servidor.
- `/venderveiculo <comprador_nome> <preço>`: Vende um carro da garagem do usuário para outro membro.

## Instalação

Para começar a utilizar o Roleplay Discord Bot, siga os passos abaixo:

1. Clone este repositório para o seu ambiente local:

   ```bash
   git clone https://github.com/wyllyanvieira/Discord-BOT-RP.git
   ```

2. Instale as dependências do projeto:

   ```bash
   npm install
   ```

3. Configure o arquivo `Configs/config.json` com as suas credenciais do Discord e outras configurações necessárias:

   ```json
    "token": "",
    "owner": "",
   ```

4. Execute o bot:

   ```bash
   npm start
   ```

## Como Usar

1. **Whitelist**: Jogadores interessados em ingressar no servidor de roleplay devem enviar um pedido de whitelist. O bot criará automaticamente um canal privado para o jogador responder perguntas de múltipla escolha e abertas.
2. **Gerenciamento de Personagens**: Após ser aprovado na whitelist, o jogador pode registrar seu personagem com informações como nome, idade e ocupação.
3. **Economia e Transações**: O bot permite que os jogadores realizem transações financeiras virtuais, depositando e sacando dinheiro, além de administrar um sistema de inventário e garagem.

## Contribuindo

Contribuições são bem-vindas! Se você deseja contribuir com este projeto, siga os passos abaixo:

1. Faça um fork do repositório.
2. Crie uma nova branch para a sua feature (`git checkout -b feature/nova-feature`).
3. Faça o commit das suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Faça o push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Tecnologias Utilizadas

- **Node.js**
- **discord.js**
- **MongoDB (ou outro banco de dados de sua escolha)**
- **Heroku/Vercel (ou outro serviço de hospedagem para o bot)**

## Suporte

Se você encontrar algum problema ou tiver alguma dúvida, sinta-se à vontade para abrir uma issue ou entrar em contato.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido com 💙 por [Wyllyan Vieira](https://github.com/wyllyanvieira)

