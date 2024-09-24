# Use the official Node.js image with a specific version.
FROM node:20

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Set environment variables from .env file (optional)
# This assumes you will have a .env file in the same directory as the Dockerfile.
COPY .env ./

# Set an environment variable to indicate the environment (optional).
# ENV NODE_ENV=production

# Specify the command to run the app.
CMD [ "node", "monitor.js" ]