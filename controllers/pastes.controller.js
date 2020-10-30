const crypto = require('crypto')

module.exports = function createUserController(db) {

    const pastes = db.collection('pastes')
    const users = db.collection('users')

    async function checkIfSlugExist(slug) {
        const result = await pastes.findOne({ slug })
        if (!result) {
            return true
        }
        return false
        // version courte: return (!result ? true : false)
    }

    function checkExposure(exposure) {
        const possibles = ['public', 'unlisted']
        console.log(possibles.indexOf(exposure))
        if (possibles.indexOf(exposure) === -1) {
            return false
        }
        return true
    }

    async function cleanPaste(paste) {
        let owner = {
            name: 'Anonymous'
        }
        if (paste.owner && paste.owner.type === 'user') {
            if (paste.show_owner && paste.show_owner === true) {
                const findRes = await users.findOne({ _id: paste.owner.id })
                if (findRes) {
                    owner.name = findRes.pseudo
                }
            }
        }
        paste.owner = owner
        return paste
    }

    return {
        async createPaste({ title, content, exposure, show_owner }, user = null) {
            let owner,
                createdAt = new Date(),
                slug,
                goodSlug = false;

            show_owner = new Boolean(show_owner)
            if (!checkExposure(exposure)) {
                return { error: 'Bad exposure parameter' }
            }
            
            while(!goodSlug) {
                slug = crypto.randomBytes(5).toString('hex')
                goodSlug = await checkIfSlugExist(slug)
            }

            // Create an "owner" variable, by default on anonymous
            owner = {
                type: 'anonymous',
                id: null,
            }
            // if we receive a user from parameters, we set the owner as needed
            if (user) {
                owner.type = 'user'
                owner.id = user._id
            }

            const inserted = await pastes.insertOne({
                title,
                content,
                slug,
                owner,
                createdAt,
                show_owner,
                exposure,
            })
            console.log({ inserted })

            return { success: true }
        },

        async getBySlug(slug) {
            let owner = {
                name: 'Anonymous'
            }
            const paste = await pastes.findOne({ slug })
            const cleaned = cleanPaste(paste)
            return cleaned
        },

        async getLatests() {
            const list = await pastes.find({ exposure: 'public' }).sort({ createdAt: -1 }).limit(10).toArray()

            const promises_list = []
            for (let paste of list) {
                promises_list.push(cleanPaste(paste))
            }

            const good_list = await Promise.all(promises_list)
            return good_list
        }
    }


}