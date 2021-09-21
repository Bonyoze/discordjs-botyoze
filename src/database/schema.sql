CREATE DATABASE BotyozeDb;

CREATE TABLE Guilds (
    guildId VARCHAR(100) NOT NULL PRIMARY KEY
);

CREATE TABLE GuildConfigurable (
    guildId VARCHAR(100) NOT NULL,
    cmdPrefix VARCHAR(10) DEFAULT '='
);