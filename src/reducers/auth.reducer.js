import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	mode: "dark",
	user: null,
	token: null,
	posts: [],
};

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setMode: (state) => {
			state.mode = state.mode === "dark" ? "light" : "dark";
		},
		loginUser: (state, action) => {
			state.user = action.payload.user;
			state.token = action.payload.token;
		},
		logoutUser: (state) => {
			state.user = null;
			state.token = null;
		},
		setFriends: (state, action) => {
			if (state.user) {
				state.user.friends = action.payload.friends;
			} else {
				console.error("This user has no friends.");
			}
		},
		setPosts: (state, action) => {
			state.posts = action.payload.posts;
		},
		setPost: (state, action) => {
			const updatedPosts = state.posts.map((post) => {
				if (post._id === action.payload.post_id)
					return action.payload.post;
				return post;
			});
			state.posts = updatedPosts;
		},
	},
});

export const { setMode, loginUser, logoutUser, setFriends, setPosts, setPost } =
	authSlice.actions;
export default authSlice.reducer;
