import { auth } from '../../utils/better-auth'

export default defineEventHandler(async (event) => {
    return auth.handler(toWebRequest(event))
}) 