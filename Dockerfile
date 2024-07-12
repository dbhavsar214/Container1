FROM node:14

# Create app directory
WORKDIR /container1

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 6000
CMD [ "node", "app.js" ]
