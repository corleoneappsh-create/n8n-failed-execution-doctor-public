FROM apify/actor-node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build
RUN npm prune --omit=dev --omit=optional
CMD ["npm", "run", "start", "--silent"]
