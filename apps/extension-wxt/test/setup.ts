import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock window.alert
vi.stubGlobal("alert", vi.fn());

// Mock window.location.reload
const mockLocation = {
  ...window.location,
  reload: vi.fn(),
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock import.meta.env
vi.stubEnv("VITE_FE_BASE_URL", "https://app.teamstash.test");
