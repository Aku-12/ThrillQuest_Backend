# #Select OS/Environment
# FROM node:22-alpine

# #Choose working directory inside docker
# WORKDIR /app

# #Copy pakage.json to install npm packages inside docker
# #COPY source destination
# COPY package*.json ./

# #Running shell command
# RUN npm install

# #Copy rest of the application
# COPY . .

# #Port Exposure
# EXPOSE 5050

# #Entry point
# CMD ["node", "index.js"]