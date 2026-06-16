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

    expect(await screen.findByText(/Today's Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Activity/i)).toBeInTheDocument();
});
