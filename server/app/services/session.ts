import User from '#models/user'

export const TOKEN_TTL = '30 days'

/** Jeton d'accès émis après une connexion complète, quelle que soit la méthode. */
export async function issueAccessToken(user: User) {
  const token = await User.accessTokens.create(user, ['*'], { expiresIn: TOKEN_TTL })
  return token.value!.release()
}
