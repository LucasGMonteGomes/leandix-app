FROM nginx:alpine

# Copiar configuração do Nginx primeiro
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos do frontend
COPY sulien /usr/share/nginx/html

# Permissões
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
