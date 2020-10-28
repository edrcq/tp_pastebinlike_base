const EventEmitter = require('events').EventEmitter
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

class MainAppEmitter extends EventEmitter {}

class MainApp {
    constructor() {
        this.events = new MainAppEmitter()
        this.db = null;
        this.collections = {}

        MongoClient.connect(
            'mongodb://localhost:27017/pastebin_like',
            { useUnifiedTopology: true },
            (error, client) => {
                if (error) {
                    console.error(error.message)
                    return process.exit(1)
                }
                this.initApp(client)
            }
        )

        
    }

    async initApp(client) {
        
        this.db = client.db('pastebin_like')
        this.collections.users = this.db.collection('users')
        this.collections.pastes = this.db.collection('pastes')

        this.webserver = await require('./webserver')(this.db)

        this.events.emit('ready')
    }

    


    
}

/* End Of MainApp class */

const app = new MainApp()

app.events.once('ready', async () => {
    console.log('App Ready!')
})