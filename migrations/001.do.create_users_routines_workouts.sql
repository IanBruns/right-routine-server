CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE routines (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    routine_name TEXT NOT NULL,
    assigned_user INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE exercises (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    exercise_name TEXT NOT NULL,
    exercise_description TEXT,
    assigned_routine INTEGER REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
    assigned_user INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL
);