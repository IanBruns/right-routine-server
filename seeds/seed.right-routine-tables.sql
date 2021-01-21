BEGIN;

TRUNCATE
    exercises,
    routines,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (user_name, password)
VALUES
('test_man', '$2a$12$Zl/Enp7x915KObPF8ehDbe9kGd3FmE.P1NvNmz01HfgHmZiNXXQc2'),
('Sonic', '$2a$12$BTKg0WyDtKUKlxFdSOHYLOBqqIApjyWPj9Z4aWX8JCt2Zh99wLAIy'),
('SupahMarioBros2', '$2a$12$lXP3SM8QE3iardCEfldfnuaXlUBZoAir9Hm553zD3H1iKz6NRbDta');

INSERT INTO routines (routine_name, assigned_user)
VALUES
('Legs', 1),
('Abs', 1),
('Arms', 2),
('Shoulders', 2),
('Cardio', 3),
('Back', 3);

INSERT INTO exercises (exercise_name, exercise_description, assigned_routine, assigned_user)
VALUES
('Squat', 'You know, a squat', 1, 1),
('Bridge', 'Make a hip bridge', 1, 1),
('Lunge', 'You Lunge', 1, 1),
('Jump Squats', null, 1, 1),
('Hamstring Curls', null, 1, 1),
('Plank', 'You make a plank', 2, 1),
('Crunch', 'Upper Abs, bby', 2, 1),
('Russian Twists', 'Twist and Shout', 2, 1),
('Dragonfly', 'Yes this is real', 2, 1),
('Heel Touches', null, 2, 1),
('Bicep Curl', null, 3, 2),
('Tricep Extensions', 'Big Arms Brent', 3, 2),
('Skull Crusher', 'Ouch', 3, 2),
('Cable Pull Down', null, 3, 2),
('Preacher Curl', 'The Iron Temple', 3, 2),
('Shrugs', 'I dunno', 4, 2),
('Overhead press', null, 4, 2),
('Front Raise', 'Anterior delts', 4, 2),
('Lateral Raise', null, 4, 2),
('Combined Raise', 'Front and Lateral combo', 4, 2),
('Run', 'One Leg in front of the other', 5, 3),
('Jump Rope', 'Up and down', 5, 3),
('Rowing Machine', 'Get it done', 5, 3),
('Burpees', null, 5, 3),
('Jumping Jacks', 'I knew a guy named Jack', 5, 3),
('Low Row', 'Lats bby', 6, 3),
('Pull Downs', null, 6, 3),
('Pull Ups', null, 6, 3),
('Deadlift', 'Deadlyft', 6, 3),
('Wide Row', null, 6, 3);

COMMIT;