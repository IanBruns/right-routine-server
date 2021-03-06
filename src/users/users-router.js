const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .post('/', jsonBodyParser, async function (req, res, next) {
        const { password, user_name } = req.body;

        for (const field of ['user_name', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });

        const passwordError = UsersService.validatePassword(password);
        if (passwordError)
            return res.status(400).json({ error: passwordError });

        const hasUserWithUserName = await UsersService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        );
        if (hasUserWithUserName)
            return res.status(400).json({ error: `Username already taken` });
            
        const hashedPassword = await UsersService.hashPassword(password);
        const newUser = {
            user_name,
            password: hashedPassword,
        };
        const user = await UsersService.insertUser(
            req.app.get('db'),
            newUser
        );

        return res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${user.id}`))
            .json(UsersService.serializeUser(user));
    });

module.exports = usersRouter;