import crypto from 'crypto'

export class PasswordService {
  private static ITERATIONS = 1000
  private static KEY_LENGTH = 64
  private static ALGORITHM = 'sha256'

  static async hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = await this.generateHash({ password, salt })
    return { hash, salt }
  }

  static async verifyPassword({
    password,
    storedHash,
    storedSalt,
  }: {
    password: string
    storedHash: string
    storedSalt: string
  }) {
    const attemptHash = await this.generateHash({ password, salt: storedSalt })
    return attemptHash === storedHash
  }

  private static generateHash({
    password,
    salt,
  }: {
    password: string
    salt: string
  }) {
    return new Promise<string>((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        this.ITERATIONS,
        this.KEY_LENGTH,
        this.ALGORITHM,
        (err, key) => {
          if (err) reject(err)
          resolve(key.toString('hex'))
        }
      )
    })
  }
}
