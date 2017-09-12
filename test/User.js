'user strict';

const _id = Symbol('id'),
    _username = Symbol('username'),
    _password = Symbol('password');
class User {
    constructor(id=0, username='', password='') {
        this[_id] = id;
        this[_username] = username;
        this[_password] = password;
    }
    set id(value) {
        this[_id] = value;
    }
    get id() {
        return this[_id];
    }
    set username(value) {
        this[_username] = value;
    }
    get username() {
        return this[_username];
    }
    set password(value) {
        this[_password] = value;
    }
    get password() {
        return this[_password];
    }
}

module.exports = User;
