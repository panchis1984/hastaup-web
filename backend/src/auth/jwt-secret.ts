/**
 * Obtiene el secreto usado para firmar y verificar los JWT.
 * Falla de forma explícita si no está configurado, evitando que la
 * aplicación arranque con un secreto por defecto predecible.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET no está definida en las variables de entorno. ' +
        'La aplicación no puede iniciar sin un secreto seguro.',
    );
  }

  return secret;
}
