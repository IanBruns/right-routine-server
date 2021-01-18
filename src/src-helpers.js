function getUserWithUserName(db, user_name) {
    return db('users')
        .where({ user_name })
        .first();
}

module.exports = {
    getUserWithUserName,
};