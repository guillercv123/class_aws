import type { APIGatewayProxyHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

type AuthContext = {
    tenantId: string;
    userId: string;
    roles: string;
    permissions: string;
    newValue: string;
};

const logger = new Logger();

export const handler: APIGatewayProxyHandler = async (event) => {
    const authorizer = event.requestContext.authorizer;
    const { name } = JSON.parse(event.body);
    if (!authorizer) {
        return {
            statusCode: 401,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Unauthorized' }),
        };
    }

    const ctx: AuthContext = {
        tenantId: String(authorizer.tenantId),
        userId: String(authorizer.userId),
        roles: String(authorizer.roles ?? '[]'),
        permissions: String(authorizer.permissions ?? '[]'),
        newValue: String(name ?? '')
    };

    logger.info('Me requested', { tenantId: ctx.tenantId, userId: ctx.userId , newValue: ctx.newValue});

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
        },
        body: JSON.stringify({
            userId: ctx.userId,
            tenantId: ctx.tenantId,
            roles: JSON.parse(ctx.roles),
            permissions: JSON.parse(ctx.permissions),
            newValue: ctx.newValue,
        }),
    };
};
