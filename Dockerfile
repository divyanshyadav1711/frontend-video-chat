# Step 1: Use Node.js lightweight base image
FROM node:16-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the entire project
COPY . .

# Step 5: Expose React's default development server port
EXPOSE 3000

# Step 6: Start the development server
CMD ["npm", "start"]