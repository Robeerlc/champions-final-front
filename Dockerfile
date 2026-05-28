# Etapa 1: Compilamos con la versión exacta que Angular quiere
FROM node:22.14-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Compila el proyecto
RUN npm run build -- --configuration=production

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine
# Copiamos los archivos de Angular
COPY --from=build /app/dist/champions-final/browser /usr/share/nginx/html

# Copiamos nuestro Nginx con el Proxy Inverso
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]