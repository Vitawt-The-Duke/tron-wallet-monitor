# Use the official Node.js image with a specific version.
FROM node:20

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory.
COPY package*.json ./

# Copy script
COPY monitor.js ./

# Install project dependencies.
RUN npm install

# Specify the command to run the app.
CMD [ "node", "monitor.js" ]
