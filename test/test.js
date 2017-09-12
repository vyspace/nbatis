'use strict';

const path = require('path'),
    SqlSessionFactory = require('../lib/SqlSessionFactory'),
    User = require('./User');

const test = async () => {
    const configPath = path.join(__dirname, './nbatis_config.json');
    const factory = new SqlSessionFactory().createPool(configPath);
    let session = null;
    try{
        session = await (factory.openSession());
        const user = new User(0, 'test05', '123456');
        await session.insert('User.add', user);
        await session.commits();
    }
    catch(err) {
        await session.rollbacks();
        throw err;
    }
    finally {
        if(session) {
            await session.release();
        }
    }
};

const test01 = async () => {
    const configPath = path.join(__dirname, './nbatis_config.json');
    const factory = new SqlSessionFactory().createPool(configPath);
    let session = null;
    try{
        session = await factory.openSession();
        const user = await session.selectOne('User.loadById', 1);
        console.log(user);
    }
    catch(err) {
        throw err;
    }
    finally {
        if(session) {
            await session.release();
        }
    }
};

