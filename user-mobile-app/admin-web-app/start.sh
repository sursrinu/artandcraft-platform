#!/bin/sh
# Log the PORT for debugging
echo "Starting nginx on port: ${PORT:-80}"
# Replace port 80 with Railway's PORT
sed -i "s/listen 80/listen ${PORT:-80}/g" /etc/nginx/conf.d/default.conf
# Show the resulting config
cat /etc/nginx/conf.d/default.conf
# Start nginx
exec nginx -g 'daemon off;'
