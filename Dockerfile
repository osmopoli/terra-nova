# Terra Nova — image de production (Node 22 + SQLite intégré, aucune dépendance native)
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server.js ./
COPY src ./src
COPY public ./public
COPY data/demo-seed.json data/initial-requests.json ./data/
RUN chown -R node:node /app/data
# La base SQLite vit dans /app/data (monter un volume pour la conserver)
VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1
USER node
CMD ["node", "--no-warnings=ExperimentalWarning", "server.js"]
