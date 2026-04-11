import type { UserDto } from "../interfaces";
import React from "react";

export const UserContext = React.createContext(null as UserDto | null);
