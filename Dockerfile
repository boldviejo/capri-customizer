FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV USE_MOCK_STORAGE=true
ENV GCS_BUCKET_NAME=capri-customizer-images
ENV GCS_PROJECT_ID=capri-customizer

EXPOSE 8080

# Start the app with the correct path
CMD ["npx", "remix-serve", "./build/server/nodejs-eyJydW50aW1lIjoibm9kZWpzIn0/index.js"]
