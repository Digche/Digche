import { AUTH_ROLE_OPTIONS } from "../constants/auth-role-options";
import styles from "./AuthPage.module.css";

export function AuthRoleSelect() {
  return (
    <label className={`${styles.field} ${styles.selectWrap}`} htmlFor="role">
      <select
        id="role"
        name="role"
        required
        defaultValue=""
        aria-label="انتخاب نقش"
        className={styles.select}
      >
        <option value="" disabled>
          انتخاب نقش
        </option>

        {AUTH_ROLE_OPTIONS.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      <svg
        className={styles.selectIcon}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
}