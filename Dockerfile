FROM nginx:alpine

# Clean default configs
RUN rm -rf /etc/nginx/conf.d/* /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets into /usr/share/nginx/html/siquantank/
COPY dist /usr/share/nginx/html/siquantank

EXPOSE 8082

CMD ["nginx", "-g", "daemon off;"]
