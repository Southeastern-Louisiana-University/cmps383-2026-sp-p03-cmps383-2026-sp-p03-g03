import type { UserDto } from "../dto-interfaces";
import React from "react";

export const UserContext = React.createContext(null as UserDto | null);
