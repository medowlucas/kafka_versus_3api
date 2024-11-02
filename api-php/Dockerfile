FROM php:7.4-apache

# Instala dependências necessárias
RUN apt-get update && apt-get install -y \
    libssl-dev \
    librdkafka-dev \
    libzip-dev \
    curl \
    git \
    unzip && \
    docker-php-ext-install zip

# Instala o PECL e a extensão rdkafka
RUN pecl install rdkafka && \
    docker-php-ext-enable rdkafka

# Instala o Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copia os arquivos da API
COPY ./public /var/www/html/
COPY composer.json /var/www/html/

# Define o diretório de trabalho
WORKDIR /var/www/html

# Instala dependências do Composer
RUN composer install --no-dev --optimize-autoloader

# Expor a porta do Apache
EXPOSE 80
