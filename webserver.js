const express = require('express')
const cors = require('cors')
const createRouter = require('./createRouter')
const Twig = require('twig')
const bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

async function createWebServer(db) {
    const app = express()

    app.disable('x-powered-by');

    app.set('views', __dirname + '/views');
    app.set('view engine', 'twig');

    // This section is optional and can be used to configure twig.
    app.set('twig options', {
        allow_async: true,
        strict_variables: false
    });

    app.use(cors())
    app.use(cookieParser())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    const router = await createRouter(db)

    app.use(router)

    const server = app.listen(8091, (err) => {
        if (err) {
            console.error(err)
            throw new Error('WebServer cannot listen to 8091')
        }
        console.log('WebServer started at port', 8091)
    })

    return { app, server }
}

module.exports = createWebServer