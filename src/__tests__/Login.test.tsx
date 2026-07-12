import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: null, isAuthenticated: false, isLoading: false,
    login: vi.fn(), logout: vi.fn(),
  }),
}));

import Login from "../pages/auth/Login";

const renderLogin = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter><Login /></MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Login Page", () => {
  it("renders CampusServe brand text", () => {
    renderLogin();
    const brands = screen.getAllByText(/CampusServe/i);
    expect(brands.length).toBeGreaterThan(0);
  });
  it("renders email input", () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/university\.edu/i)).toBeInTheDocument();
  });
  it("renders password input", () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
  });
  it("renders sign in button", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
  it("renders register link", () => {
    renderLogin();
    expect(screen.getByRole("link", { name: /register here/i })).toBeInTheDocument();
  });
  it("renders available roles section", () => {
    renderLogin();
    expect(screen.getByText(/AVAILABLE ROLES/i)).toBeInTheDocument();
  });
});
