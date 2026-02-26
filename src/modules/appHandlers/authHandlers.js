import { login, register } from "../../Utils/services";
import { validateEmail, validatePassword } from "../../Utils/authValidation";
import { handleError } from "../../Utils/networkUtils";

export function createAuthHandlers({
  form,
  setLoading,
  setLoginMessage,
  setFormErrors,
  setUser,
}) {
  function handleLogin() {
    if (form.website) {
      setLoading((l) => ({ ...l, login: true }));
      setTimeout(() => {
        setLoading((l) => ({ ...l, login: false }));
        setLoginMessage({ type: "error", text: "An error occurred. Please try again." });
      }, 2000);
      return;
    }

    const errors = { email: "", password: "" };
    setLoginMessage(null);

    const trimmedEmail = (form.email || "").trim();
    if (!trimmedEmail) {
      errors.email = "Please enter your email address";
    } else if (!validateEmail(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    const trimmedPassword = (form.password || "").trim();
    if (!trimmedPassword) {
      errors.password = "Please enter your password";
    } else if (!validatePassword(trimmedPassword)) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    if (errors.email || errors.password) return;

    setLoading((l) => ({ ...l, login: true }));
    login(trimmedEmail, trimmedPassword)
      .then((user) => {
        setUser(user);
        setLoginMessage(null);
      })
      .catch((err) => {
        const errorMsg = handleError(err);
        setLoginMessage({ type: "error", text: errorMsg });
      })
      .finally(() => setLoading((l) => ({ ...l, login: false })));
  }

  function handleRegister() {
    if (form.website) {
      setLoading((l) => ({ ...l, register: true }));
      setTimeout(() => {
        setLoading((l) => ({ ...l, register: false }));
        setLoginMessage({ type: "error", text: "An error occurred. Please try again." });
      }, 2000);
      return;
    }

    const errors = { email: "", password: "" };
    setLoginMessage(null);

    const trimmedEmail = (form.email || "").trim();
    if (!trimmedEmail) {
      errors.email = "Please enter your email address";
    } else if (!validateEmail(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    const trimmedPassword = (form.password || "").trim();
    if (!trimmedPassword) {
      errors.password = "Please enter your password";
    } else if (!validatePassword(trimmedPassword)) {
      errors.password = "Password must be at least 8 characters";
    }

    setFormErrors(errors);
    if (errors.email || errors.password) return;

    setLoading((l) => ({ ...l, register: true }));
    register(trimmedEmail, trimmedPassword)
      .then(setUser)
      .catch((err) => {
        const errorMsg = handleError(err);
        setLoginMessage({ type: "error", text: errorMsg });
      })
      .finally(() => setLoading((l) => ({ ...l, register: false })));
  }

  return {
    handleLogin,
    handleRegister,
  };
}
