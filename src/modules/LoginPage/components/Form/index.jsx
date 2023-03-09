import { useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Formik } from "formik";
import * as yup from "yup"; // validation lib
import Dropzone from "react-dropzone";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import { loginUser } from "reducers/auth.reducer.js";

import FlexBetween from "sharedComponents/FlexBetween";

const registerSchema = yup.object().schema({
	firstName: yup.string().required("required"),
	lastName: yup.string().required("required"),
	email: yup.string().email("invalid email").required("required"),
	password: yup.string().required("required"),
	location: yup.string().required("required"),
	occupation: yup.string().required("required"),
	picture: yup.string().required("required"),
});

const loginSchema = yup.object().schema({
	email: yup.string().email("invalid email").required("required"),
	password: yup.string().required("required"),
});

const initialValuesRegister = {
	firstName: "",
	lastName: "",
	email: "",
	password: "",
	location: "",
	occupation: "",
	picture: "",
};

const initialValuesLogin = {
	email: "",
	password: "",
};

const Form = () => {
	const [pageType, setPageType] = useState("login");
	const { palette } = useTheme();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const isNonMobile = useMediaQuery("(min-width: 600px)");
	const isLogin = pageType === "login";
	const isRegister = pageType === "register";

	const handleFormSubmit = async (values, onSubmitProps) => {};

	return (
		<Formik
			onSubmit={handleFormSubmit}
			validationSchema={isLogin ? loginSchema : registerSchema}
			initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
		>
			{({
				values,
				errors,
				touched,
				handleBlur,
				handleChange,
				handleSubmit,
				setFieldValue,
				resetForm,
			}) => {
				<form onSubmit={handleSubmit}>
					<Box
						display="flex"
						gap="30px"
						gridTemplateColumns="repeat(4, minmax(0, 1fr))"
						sx={{
							"& > div": {
								gridColumn: isNonMobile ? undefined : "span 4",
							},
						}}
					>
						{isRegister ? (
							<>
								<TextField
									label="First Name"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.firstName}
									name="firstName"
									error={
										Boolean(touched.firstName) &&
										Boolean(errors.firstName)
									}
									helperText={
										touched.firstName && errors.firstName
									}
									sx={{ gridColumn: "span 2" }}
								/>
								<TextField
									label="Last Name"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.lastName}
									name="lastName"
									error={
										Boolean(touched.lastName) &&
										Boolean(errors.lastName)
									}
									helperText={
										touched.lastName && errors.lastName
									}
									sx={{ gridColumn: "span 2" }}
								/>
								<TextField
									label="Location"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.location}
									name="location"
									error={
										Boolean(touched.location) &&
										Boolean(errors.location)
									}
									helperText={
										touched.location && errors.location
									}
									sx={{ gridColumn: "span 4" }}
								/>
								<TextField
									label="Occupation"
									onBlur={handleBlur}
									onChange={handleChange}
									value={values.occupation}
									name="occupation"
									error={
										Boolean(touched.occupation) &&
										Boolean(errors.occupation)
									}
									helperText={
										touched.occupation && errors.occupation
									}
									sx={{ gridColumn: "span 4" }}
								/>
							</>
						) : null}
					</Box>
				</form>;
			}}
		</Formik>
	);
};

export default Form;
