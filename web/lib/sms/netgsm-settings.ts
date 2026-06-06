export type NetgsmTenantConfig = {
  usercode: string;
  password: string;
  msgheader: string;
  appname: string | null;
  enabled: boolean;
};

export type NetgsmTenantConfigPublic = {
  usercode: string;
  msgheader: string;
  appname: string | null;
  enabled: boolean;
  passwordSet: boolean;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function parseNetgsmFromSettingsJson(settingsJson: unknown): NetgsmTenantConfig | null {
  if (!isRecord(settingsJson)) return null;
  const raw = settingsJson.netgsm;
  if (!isRecord(raw)) return null;

  const usercode = typeof raw.usercode === "string" ? raw.usercode.trim() : "";
  const password = typeof raw.password === "string" ? raw.password : "";
  const msgheader = typeof raw.msgheader === "string" ? raw.msgheader.trim() : "";
  if (!usercode || !password || !msgheader) return null;

  return {
    usercode,
    password,
    msgheader,
    appname: typeof raw.appname === "string" && raw.appname.trim() ? raw.appname.trim() : null,
    enabled: raw.enabled !== false,
  };
}

export function toPublicNetgsmConfig(config: NetgsmTenantConfig | null): NetgsmTenantConfigPublic {
  if (!config) {
    return {
      usercode: "",
      msgheader: "",
      appname: null,
      enabled: false,
      passwordSet: false,
    };
  }
  return {
    usercode: config.usercode,
    msgheader: config.msgheader,
    appname: config.appname,
    enabled: config.enabled,
    passwordSet: Boolean(config.password),
  };
}

export function mergeNetgsmIntoSettingsJson(
  existing: unknown,
  input: {
    usercode: string;
    password: string | null;
    msgheader: string;
    appname: string | null;
    enabled: boolean;
  },
  previous: NetgsmTenantConfig | null
): Record<string, unknown> {
  const base = isRecord(existing) ? { ...existing } : {};
  const password =
    input.password?.trim() ||
    previous?.password ||
    "";
  base.netgsm = {
    usercode: input.usercode.trim(),
    password,
    msgheader: input.msgheader.trim(),
    appname: input.appname?.trim() || null,
    enabled: input.enabled,
  };
  return base;
}
