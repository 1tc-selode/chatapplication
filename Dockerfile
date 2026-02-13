FROM php:8.2-cli

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/ /app/

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Create SQLite database
RUN touch /app/database/database.sqlite

# Set permissions
RUN chmod -R 777 /app/storage /app/bootstrap/cache /app/database

# Expose port
EXPOSE 8000

# Start server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
