#!/bin/sh
set -eu

PORT_VALUE="${PORT:-8080}"
sed "s/__PORT__/${PORT_VALUE}/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g 'daemon off;'
