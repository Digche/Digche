import { AUTH_ROLE_OPTIONS } from "../constants/auth-role-options";
import type { AuthRole } from "../types/auth.types";
import styles from "./AuthPage.module.css";

type AuthRoleSelectProps = {
  value: AuthRole;
  onChange: (role: AuthRole) => void;
};

export function AuthRoleSelect({ value, onChange }: AuthRoleSelectProps) {
  return (
    <div className={styles.roleTabs} aria-label="انتخاب نوع کاربر" role="tablist">
      {AUTH_ROLE_OPTIONS.map((role) => {
        const isActive = value === role.value;

        return (
          <button
            key={role.value}
            className={`${styles.roleTab} ${
              isActive ? styles.roleTabActive : ""
            }`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(role.value)}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}