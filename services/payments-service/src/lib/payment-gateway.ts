/**
 * Gateway de pagos simulado (mock del servicio externo poco confiable).
 *
 * En la sesión 4 simula el comportamiento de un gateway real:
 *   - Montos > 1000 se rechazan (declined).
 *   - La variable de entorno GATEWAY_FORCE_FAIL='true' fuerza un fallo
 *     (para demostrar la apertura del circuit breaker en vivo).
 *
 * En producción esto sería una llamada HTTP a Stripe / Culqi / etc.
 */
export interface GatewayResult {
  gatewayRef: string;
  status: 'approved';
}

export async function callExternalGateway(amount: number): Promise<GatewayResult> {
  if (process.env.GATEWAY_FORCE_FAIL === 'true') {
    throw new Error('GatewayUnavailable');
  }
  if (amount > 1000) {
    throw new Error('PaymentDeclined');
  }
  return { gatewayRef: `gw_${Date.now()}`, status: 'approved' };
}
