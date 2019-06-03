const express = require('express');
const router = express.Router();
const path = require('path')
const User = require('./db/user')
const logger = require('./logger')

router.get('/', async (req, res) => {
  try {
    res.render('index', {})
  } catch (err) {
    logger.error('/error %O', err)
    res.statusMessage = err.message
    res.status(412).end()
  }
})

router.get('/learning/*', async (req, res) => {
  try {
    res.render('learning', {})
  } catch (err) {
    logger.error('/error %O', err)
    res.statusMessage = err.message
    res.status(500).end()
  }
})


router.get('/springs', async (req, res) => {
  try {
    res.render('springs', {})
  } catch (err) {
    logger.error('/error %O', err)
    res.statusMessage = err.message
    res.status(500).end()
  }
})

router.post('/newSystem', async (req, res) => {
  try {
    const { key, system } = req.body;
    let user = await User.findOne({ key: key }).exec();
    if ( !user ) { user = await User.create({ key : key }) }
    user.systems.push(system)
    await user.save()
    logger.verbose(`User ${key} is creating a new system `)
    res.send(true);
  } catch (err) {
    logger.error('Error creating new system ', err)
    res.status(500).send()
  }
})

router.post('/systemError', async (req, res) => {
  try {
    const { userKey, systemKey, err } = req.body;
    const user = await User.findOne({ key: userKey }).exec();
    if (!user) { throw new Error('systemError report with no valid user') }

    logger.error('System Error from client user : %O systemKey : %O  err : %O', user, systemKey, err)
    res.send('sorry');
  } catch (err) {
    logger.error('systemError Error reporting', err)
    res.status(500).send()
  }
})

router.get('/getUser', async (req, res) => {
  try {
    const { key } = req.query;
    const user = await User.findOne({key : key }).exec();
    // console.log('found user ', user.systems.length)
    res.send(user);

  } catch (err) {
    logger.error('Error creating new system ', err)
    res.status(500).send()
  }
})



module.exports = router;
