import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../context/AuthContext";

vi.mock("../api/authApi", () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({
      data: {
        access: "mock-access-token",
        refresh: "mock-refresh-token",
        user: {
          id: "123", email: "test@uni.edu",
          first_name: "Test", last_name: "User",
          full_name: "Test User",
          role: { id: 1, name: "student" },
          is_active: true,
          date_joined: new Date().toISOString(),
          phone: "", department: "",
        },
      },
    }),
  },
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

const TestComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="auth">{isAuthenticated ? "yes" : "no"}</p>
      <p data-testid="user">{user?.full_name ?? "none"}</p>
      <button onClick={() => login("test@uni.edu", "pass")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => { localStorageMock.clear(); });

  it("starts unauthenticated", () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    expect(screen.getByTestId("auth").textContent).toBe("no");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("authenticates after login", async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await act(async () => { screen.getByText("Login").click(); });
    expect(screen.getByTestId("auth").textContent).toBe("yes");
    expect(screen.getByTestId("user").textContent).toBe("Test User");
  });

  it("clears state after logout", async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await act(async () => { screen.getByText("Login").click(); });
    act(() => { screen.getByText("Logout").click(); });
    expect(screen.getByTestId("auth").textContent).toBe("no");
  });
});
