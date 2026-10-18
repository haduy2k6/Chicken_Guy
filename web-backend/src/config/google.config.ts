import {registerAs} from "@nestjs/config"

export default registerAs('google',()=>({
     clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:"http://localhost:4001/auth/google/callback"
}))