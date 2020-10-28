const Router = require('express').Router
const createUserController = require('./controllers/users.controller')


async function createRouter(db) {
    const router = Router()
    const UserController = createUserController(db)

    async function isAuth(req, res, next) {
        console.log('isAuth is called now')
        if (req.headers['authorization']) {
            const token = req.headers['authorization']
            console.log('token is', token)
            const result = await db.collection('users').findOne({ authToken: token })
            if (result) {
                req.isAuth = true
                req.authUser = result
            }
        }

        next();
    }

    /* Ceci est le block de code a dupliquer pour continuer l'app */
    router.get('/', (req, res) => {

        return res.json({ hello: 'world' })
    })

    router.post('/signup', async function(req, res) {
        const signupResult = await UserController.signup(req.body)
        return res.json(signupResult)
    })

    router.post('/login', async function(req, res) {
        const loginResult = await UserController.login(req.body)
        return res.json(loginResult)
    })

    router.get('/my-pastes', isAuth, async function (req, res) {
        if (!req.isAuth) {
            return res.status(401).end();
        }
        const mypastes = await db.collection('pastes').find({ 'owner.id': req.authUser._id }, 'title slug createdAt').toArray()

        return res.json({
            list: mypastes,
            isAuth: req.isAuth,
        })
    })

    router.get('/:slug', isAuth, async function (req, res) {
        console.log(req.params.slug)

        return res.json({ slug: req.params.slug })
    })

    
    return router
}

module.exports = createRouter