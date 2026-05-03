SELECT 'CREATE DATABASE dukedb' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'dukedb')