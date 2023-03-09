import { useMemo } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme.js";

import HomePage from "modules/HomePage";
import LoginPage from "modules/LoginPage";
import ProfilePage from "modules/ProfilePage";

function App() {
	const mode = useSelector((s) => s.mode);
	const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
	return (
		<div className="app">
			<BrowserRouter>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<Routes>
						<Route path="/" element={<LoginPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/home" element={<HomePage />} />
						<Route
							path="/profile/:userId"
							element={<ProfilePage />}
						/>
						{/* fallback route */}
						<Route path="*" element={<ProfilePage />} />
					</Routes>
				</ThemeProvider>
			</BrowserRouter>
		</div>
	);
}

export default App;
