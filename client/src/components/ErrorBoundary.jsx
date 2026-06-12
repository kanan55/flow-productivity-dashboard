import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Flow UI crashed:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="min-h-screen flex items-center justify-center bg-surface-50 px-4 text-surface-900 dark:bg-surface-950 dark:text-surface-50">
                    <section className="max-w-md rounded-lg border border-surface-200 bg-white p-6 text-center shadow-soft dark:border-surface-800 dark:bg-surface-900">
                        <h1 className="font-display text-2xl">Something went wrong</h1>
                        <p className="mt-2 text-sm text-surface-500">
                            Refresh the page to reload Flow. Your saved local data will stay in the browser.
                        </p>
                    </section>
                </main>
            );
        }

        return this.props.children;
    }
}
