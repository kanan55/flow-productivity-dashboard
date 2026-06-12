import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";
import { AppProvider } from "../context/AppContext";
import ErrorBoundary from "../components/ErrorBoundary";

test("renders the dashboard overview", async () => {
    render(
        <AppProvider>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AppProvider>
    );

    expect(await screen.findByText(/productivity overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Productivity Score/i)).toBeInTheDocument();
});
