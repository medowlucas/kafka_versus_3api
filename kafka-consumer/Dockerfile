FROM node:14

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código da aplicação
COPY . .

# Expõe a porta da aplicação
EXPOSE 8083

# Comando para iniciar o consumidor
CMD ["node", "index.js"]
