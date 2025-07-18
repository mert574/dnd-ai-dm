import { successResponse } from '../../utils/api';
import { requireAuth } from '../../utils/auth/middleware';

export default defineEventHandler(async (event) => {
    const user = await requireAuth(event);

    return successResponse({
        id: user.id,
        name: user.name,
        email: user.email
    });
}); 