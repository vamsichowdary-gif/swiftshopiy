FROM php:8.3-cli-alpine

# Install system dependencies, PostgreSQL client, and build tools
RUN apk add --no-cache \
    libpq-dev \
    postgresql-client \
    git \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Copy Composer binary
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy dependency manifests first to leverage Docker layer caching
COPY composer.json composer.lock ./

# Install vendor dependencies without scripts (code isn't copied yet)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy the rest of the application codebase
COPY . .

# Generate optimized autoloader and run discovery scripts
RUN composer dump-autoload --optimize --no-dev

# Set permissions for Laravel directories
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Allow dynamic Render port fallback to 10000
ENV PORT=10000
EXPOSE ${PORT}

# Startup entrypoint: migrate, cache configuration, and serve
CMD php artisan config:clear \
    && php artisan migrate --force \
    && php artisan serve --host=0.0.0.0 --port=${PORT}