import { JwtPayload } from './index.js';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
