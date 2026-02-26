import { useEffect } from "react";
import { getCode, getCountdown } from "../Utils/services";

export function useCodesTicker(accounts, setCodes, setCountdowns) {
  useEffect(() => {
    const interval = setInterval(() => {
      const newCodes = {};
      const newCountdowns = {};
      accounts.forEach((acc) => {
        newCodes[acc.id] = getCode(acc.secret);
        newCountdowns[acc.id] = getCountdown();
      });
      setCodes(newCodes);
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [accounts, setCodes, setCountdowns]);
}
