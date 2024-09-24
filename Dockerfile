# Use the official Node.js image with a specific version.
FROM node:20

# Set the working directory inside the container.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory.
# This allows Docker to cache the npm install step if there are no changes to these files.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Set an environment variable to indicate the environment (optional).
# ENV NODE_ENV=production

# Specify the command to run the app.
CMD [ "node", "monitor.js" ]
