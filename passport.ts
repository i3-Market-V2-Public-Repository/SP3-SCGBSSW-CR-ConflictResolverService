'use strict'

import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { Issuer, Strategy as OidcStrategy, TokenSet } from 'openid-client'
import config from './config'

export default async (): Promise<typeof passport> => {
  const issuer = await Issuer.discover(config.oidc.providerUri)
  console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata)

  const client = new issuer.Client(config.oidc.client)

  /**
   * JWT strategies differ in how the token is got from the request:
   * either cookies or the HTTP bearer authorization header
   */
  passport.use('jwtBearer', new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.secret
    },
    (jwtPayload, done) => {
      return done(null, jwtPayload)
    }
  ))

  passport.use('oidc',
    new OidcStrategy({
      client,
      usePKCE: false
    }, (token: TokenSet, done: Function) => {
      return done(null, token)
    }))

  return passport
}
