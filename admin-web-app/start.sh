#!/bin/sh
# Replace port 80 with Railway's PORT
sed -i "s/listen 80/listen ${PORT:-80}/g" /etc/nginx/conf.d/default.conf
# Start nginx
exec nginx -g 'daemon off;'
