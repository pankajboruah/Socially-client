import React from "react";
import { history } from "store";

const ErrorText = {
	color: "#bb3b3b",
	"font-size": "18px",
};

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, message: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, message: error && error.message };
	}

	componentDidCatch(error, errorInfo) {
		this.setState({
			message: errorInfo,
		});
		console.error(error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			// You can render any custom fallback UI
			history.push("/error/500");
			return (
				<div style={ErrorText}>
					{this.state.message || "Something went wrong"}
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
