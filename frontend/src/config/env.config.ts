class EnvironmentConfig {
  public readonly apiUrl: string;
  public readonly appUrl: string;
  public readonly isProduction: boolean;
  public readonly isDevelopment: boolean;

  constructor() {
    this.apiUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4002";
    this.appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3002";
    this.isProduction = process.env.NODE_ENV === "production";
    this.isDevelopment = process.env.NODE_ENV === "development";
  }
}

export const ENV = new EnvironmentConfig();
