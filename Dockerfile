# Use the official Node.js image.
FROM node:20

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of your application code.
COPY . .

# Specify the command to run the app.
CMD [ "node", "monitor.js" ]
