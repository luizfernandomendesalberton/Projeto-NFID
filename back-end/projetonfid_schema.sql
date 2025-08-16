-- Script para criar as tabelas do Projeto-NFID no MySQL
CREATE DATABASE IF NOT EXISTS projeto_nfid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE projeto_nfid;

CREATE TABLE IF NOT EXISTS funcionario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    nome VARCHAR(100),
    cargo VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS estoque (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS material (
    numeroSerie VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(255),
    local VARCHAR(255) NOT NULL,
    funcionario VARCHAR(100) NOT NULL
);
