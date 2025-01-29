# Base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy only package files for dependency installation
COPY package.json package-lock.json ./

# Install all dependencies, including devDependencies
RUN npm install -g npm@11.0.0

RUN npm install

# Copy all source files into the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]