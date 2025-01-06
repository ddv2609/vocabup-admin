import { useReduxDispatch, useReduxSelector } from ".";
import { logout } from "../redux/slice";
import { login, LoginForm } from "../redux/thunk";

const useAuth = () => {
  const isAuthenticated: boolean = useReduxSelector(
    (state) => state.app.isAuthenticated
  );

  const dispatch = useReduxDispatch();
  const adminLogin = (payload: LoginForm) => dispatch(login(payload));
  const adminLogout = () => dispatch(logout());

  return {
    isAuthenticated,
    adminLogin,
    adminLogout,
  };
};

export default useAuth;
