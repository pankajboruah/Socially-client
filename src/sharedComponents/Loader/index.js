import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { makeStyles } from "@mui/material/styles";

import { DefaultColor } from "utils/constants";

const useStyles = makeStyles((theme) => ({
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: DefaultColor,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
	},
	backdropCarousel: {
		zIndex: theme.zIndex.drawer + 1,
		color: DefaultColor,
		backgroundColor: "rgba(0, 0, 0, 0.1)",
	},
}));

const Loader = ({ loading = false }) => {
	const classes = useStyles();
	return loading ? (
		<div>
			<Backdrop className={classes.backdrop} open>
				<CircularProgress color="inherit" />
			</Backdrop>
		</div>
	) : null;
};

export default Loader;
