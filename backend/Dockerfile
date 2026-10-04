FROM php:8.3-cli-alpine

# Install system dependencies and PostgreSQL driver
RUN apk add --no-cache \
    libpq-dev \
    postgresql-client \
    git \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy backend files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Storage permissions
RUN chmod -R 777 storage bootstrap/cache

# Expose Render default port
EXPOSE 10000

# Clear cache, run migrations, and start Laravel artisan serve
CMD php artisan config:clear && php artisan migrate --force && php artisan db:seed --force && php artisan serve --host=0.0.0.0 --port=10000