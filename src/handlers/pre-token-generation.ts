import type { PreTokenGenerationV2TriggerHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { derivePermissions } from '../lib/permissions';

const logger = new Logger();

export const handler: PreTokenGenerationV2TriggerHandler = async (event) => {
    const { userAttributes, groupConfiguration } = event.request;

    const tenantId = userAttributes['custom:tenant_id'];
    if (!tenantId) {
        logger.warn('User has no tenant_id attribute', { username: event.userName });
        // No lanzamos: dejamos que Cognito emita el token sin claims custom;
        // los handlers downstream tratarán al usuario como sin acceso.
        return event;
    }

    const roles = groupConfiguration?.groupsToOverride ?? [];
    const permissions = derivePermissions(roles);

    event.response = {
        claimsAndScopeOverrideDetails: {
            accessTokenGeneration: {
                claimsToAddOrOverride: {
                    tenant_id: tenantId,
                    roles: JSON.stringify(roles),
                    permissions: JSON.stringify(permissions),
                },
            },
            idTokenGeneration: {
                claimsToAddOrOverride: {
                    tenant_id: tenantId,
                    roles: JSON.stringify(roles),
                },
            },
        },
    };

    logger.info('Claims injected', { tenantId, roles, username: event.userName });
    return event;
};