FROM php:8.1-apache

# Instalar extensões PHP necessárias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Habilitar módulos do Apache
RUN a2enmod rewrite headers

# Configurar PHP
RUN echo "session.cookie_samesite = None" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "session.cookie_secure = Off" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "upload_max_filesize = 10M" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "post_max_size = 10M" >> /usr/local/etc/php/conf.d/custom.ini

# Copiar código do backend
COPY . /var/www/html/

# Permissões
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

WORKDIR /var/www/html

EXPOSE 80
