import type { UserDto } from "../api/interfaces";
import React from "react";

export const UserContext = React.createContext(null as UserDto | null);
