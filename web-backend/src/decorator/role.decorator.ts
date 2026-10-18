import { Reflector } from "@nestjs/core";
import { UserRole } from "../Entity-User/User.entity.js";

export const Roles = Reflector.createDecorator<UserRole[]>();