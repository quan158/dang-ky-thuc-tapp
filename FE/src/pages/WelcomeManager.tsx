import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import { Account } from "../types/DataTypes";

const WelcomeManager: React.FC = () => {
  const [user, setUser] = useState< Account | null>(null);

  // Gọi fetch user khi component mount
  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await AuthService.getUserInfo();
      setUser(userInfo);
    };

    fetchUser();
  }, []);

  // Gọi lại khi có thay đổi trong localStorage
  useEffect(() => {
    const updateUser = async () => {
      const userInfo = await AuthService.getUserInfo();
      setUser(userInfo);
    };

    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  return (
    <div className="row">
      <div>
        <h2>Welcome</h2>
        {user ? (
            <p>
              Logged in as: {user.fullname} ({user.roles})
            </p>
        ) : (
          <p>Not logged in</p>
        )}
      </div>
    </div>
  );
};

export default WelcomeManager;
