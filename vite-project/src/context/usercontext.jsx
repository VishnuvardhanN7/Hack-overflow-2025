import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: "Alex Chen",
    role: "Software Engineering",
    college: "SRKR Engineering College",
    email: "alex@email.com",
    github: "https://github.com/Shailesh2005-code",
    skills: "Java, React, SQL",
    bio: "Passionate student exploring software engineering."
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
