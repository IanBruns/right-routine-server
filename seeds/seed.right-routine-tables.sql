BEGIN;

TRUNCATE
    exercises,
    routines,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password)
VALUES
('test_man', '$2a$12$Zl/Enp7x915KObPF8ehDbe9kGd3FmE.P1NvNmz01HfgHmZiNXXQc2'),
('IanB', '$2a$12$ep63T/z3g5cgd0fqPZOVmedDup1KKr1ecVwCn.lgu0hwcZnV36rgi'),
('Stored', '$2a$12$3Fji734zQbVwUwbm9r/Eauc.NHtxygCzwDRU/0kvbm/n2KFzDjGrm'),
('Sonic', '$2a$12$BTKg0WyDtKUKlxFdSOHYLOBqqIApjyWPj9Z4aWX8JCt2Zh99wLAIy'),
('xkcd', '$2a$12$Nd3/Ih8i/RmPYBPLJ2w/gOoC/dgQna0A/.9ggs/1ke0F70dlmh2xO'),
('SupahMarioBros2', '$2a$12$lXP3SM8QE3iardCEfldfnuaXlUBZoAir9Hm553zD3H1iKz6NRbDta');


COMMIT;