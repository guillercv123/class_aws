import type {
    APIGatewayRequestAuthorizerHandler,
    APIGatewayAuthorizerResult,
} from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger();


const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID!,
    tokenUse: 'access',
    clientId: process.env.CLIENT_ID!,
});

export const handler: APIGatewayRequestAuthorizerHandler = async (event) => {
    const token = extractToken(event.headers?.Authorization ?? event.headers?.authorization);
    if (!token) {
        logger.warn('No Authorization header');
        return deny('anonymous', event.methodArn);
    }

    try {
        const payload = await verifier.verify(token);

        const tenantId = payload.tenant_id as string | undefined;
        if (!tenantId) {
            logger.warn('Token missing tenant_id', { sub: payload.sub });
            return deny(payload.sub, event.methodArn);
        }

        logger.info('Token verified', { sub: payload.sub, tenantId });

        return allow(payload.sub, event.methodArn, {
            tenantId,
            userId: payload.sub,
            roles: (payload.roles as string) ?? '[]',
            permissions: (payload.permissions as string) ?? '[]',
        });
    } catch (err) {
        logger.error('JWT verification failed', { err });
        return deny('anonymous', event.methodArn);
    }
};

function extractToken(header?: string): string | null {
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !value) return null;
    return value;
}

function allow(
    principalId: string,
    methodArn: string,
    context: Record<string, string>,
): APIGatewayAuthorizerResult {
    return {
        principalId,
        policyDocument: buildPolicy('Allow', methodArn),
        context,
    };
}

function deny(principalId: string, methodArn: string): APIGatewayAuthorizerResult {
    return {
        principalId,
        policyDocument: buildPolicy('Deny', methodArn),
    };
}

function buildPolicy(effect: 'Allow' | 'Deny', methodArn: string) {
    // Scope al stage completo del API para evitar re-authorize por endpoint.
    // En sesión 9 refinamos con recurso por tenant.
    const arnParts = methodArn.split(':');
    const apiGatewayArn = arnParts.slice(0, 5).join(':');
    // @ts-ignore
    const [apiId, stage] = arnParts[5].split('/');
    const resource = `${apiGatewayArn}:${apiId}/${stage}/*/*`;

    return {
        Version: '2012-10-17',
        Statement: [{ Action: 'execute-api:Invoke', Effect: effect, Resource: resource }],
    };
}