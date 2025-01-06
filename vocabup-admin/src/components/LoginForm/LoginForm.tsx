import React, {
  ChangeEvent,
  SyntheticEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./LoginForm.module.scss";
import { useAuth, useReduxSelector } from "../../hooks";
import clsx from "clsx";
import {
  Alignment,
  Fit,
  Layout,
  RiveState,
  StateMachineInput,
  useRive,
  UseRiveParameters,
  useStateMachineInput,
} from "rive-react";
import { LoginStatus, Path } from "../../constants";
import { useNavigate } from "react-router-dom";

const STATE_MACHINE_NAME = "Login Machine";

const LoginForm: React.FC = (riveProps: UseRiveParameters = {}) => {
  const { adminLogin } = useAuth();
  const nav = useNavigate();

  const { rive: riveInstance, RiveComponent }: RiveState = useRive({
    src: "login-teddy.riv",
    stateMachines: STATE_MACHINE_NAME,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    ...riveProps,
  });

  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "admin",
  });

  const loginStatus = useReduxSelector((state) => state.app.loginStatus);

  const [inputLookMultiplier, setInputLookMultiplier] = useState<number>(0);

  const inputRef: React.RefObject<HTMLInputElement> = useRef(null);

  const isCheckingInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "isChecking"
  )!;

  const numLookInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "numLook"
  )!;

  const isHandsUpInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "isHandsUp"
  )!;

  const trigSuccessInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigSuccess"
  )!;

  const trigFailInput: StateMachineInput = useStateMachineInput(
    riveInstance,
    STATE_MACHINE_NAME,
    "trigFail"
  )!;

  const handleChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setUser((prev) => ({ ...prev, email: newEmail }));
    if (!isCheckingInput.value) {
      isCheckingInput.value = true;
    }

    const numChars = newEmail.length;
    numLookInput.value = numChars * inputLookMultiplier;
  };

  const handleEmailFocus = () => {
    isCheckingInput.value = true;
    if (numLookInput.value !== user.email.length * inputLookMultiplier)
      numLookInput.value = user.email.length * inputLookMultiplier;
  };

  const handleChangePassword = (e: ChangeEvent<HTMLInputElement>) => {
    setUser((prev) => ({ ...prev, password: e.target.value?.trim() }));
  };

  const handleLogin = (e: SyntheticEvent) => {
    e.preventDefault();
    isHandsUpInput.value = false;
    adminLogin(user)
      .unwrap()
      .then((data) => {
        trigSuccessInput.fire();
        nav(Path.DASHBOARD);
      })
      .catch((error) => {
        console.error(error);
        trigFailInput.fire();
      });
  };

  useEffect(() => {
    if (inputRef.current && !inputLookMultiplier) {
      setInputLookMultiplier(inputRef.current.offsetWidth / 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputRef]);

  return (
    <div className={styles.container}>
      <div className={styles.loginFormComponentRoot}>
        <div className={styles.riveContainer}>
          <RiveComponent className={styles.riveWrapper} />
        </div>
        <div className={styles.loginFormContainer}>
          <form onSubmit={handleLogin}>
            <label>
              <input
                type="email"
                ref={inputRef}
                className={clsx([styles.formEmail, "txt---400-14-18-regular"])}
                name="email"
                placeholder="Email"
                value={user.email}
                onChange={handleChangeEmail}
                onFocus={handleEmailFocus}
                onBlur={() => (isCheckingInput.value = false)}
                required
              />
            </label>

            <label>
              <input
                type="password"
                className={clsx([
                  styles.formPassword,
                  "txt---400-14-18-regular",
                ])}
                name="password"
                placeholder="Password (ssh.. it's 'teddy')"
                value={user.password}
                onChange={handleChangePassword}
                onFocus={() => (isHandsUpInput.value = true)}
                onBlur={() => (isHandsUpInput.value = false)}
                required
              />
            </label>

            <button
              className={clsx([styles.loginBtn, "txt---600-16-20-bold"])}
              disabled={loginStatus === LoginStatus.PENDING}
            >
              {loginStatus === LoginStatus.PENDING ? "Submitting..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
