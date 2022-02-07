<template>
	<v-app>
		<v-content class="wrapper">
			<v-container fluid fill-height>
				<v-layout row wrap align-center justify-center>
					<v-flex xs12 sm8 md8>
						<v-card class="elevation-12" style="border-radius: 8px">
							<v-toolbar class="v-toolbar" flat>
								<v-toolbar-title style="color: black">PLC Webapp {{ version }}</v-toolbar-title>
							</v-toolbar>
							<v-card-text>
								<v-form>
									<v-text-field
										color="black lighten-1"
										v-model="username"
										prepend-icon="person"
										name="username"
										placeholder="email"
										label="Enter your email"
										type="text"
									></v-text-field>
									<v-text-field
										color="black lighten-1"
										v-model="password"
										prepend-icon="lock"
										name="password"
										placeholder="password"
										label="Enter your password"
										id="password"
										type="password"
									></v-text-field>
								</v-form>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn
									center
									flat
									color="black darken-1"
									:disabled="!username || !password"
									@shortkey="login({ username, password })"
									v-on:click="login({ username, password })"
									>Login</v-btn
								>
								<v-spacer></v-spacer>
								<v-spacer></v-spacer>
								<v-btn center flat color="black darken-1">Not a user yet? Register</v-btn>
								<v-spacer></v-spacer>
							</v-card-actions>
							<v-alert outline color="error" icon="warning" :value="errorMessage != ''"
								>Failed to log in : {{ errorMessage }}</v-alert
							>
						</v-card>
					</v-flex>
				</v-layout>
			</v-container>
		</v-content>
	</v-app>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import packageJson from "../package.json";
export default {
	name: "Auth",
	data: () => ({
		username: "",
		password: "",
		version: packageJson.version,
	}),
	computed: {
		...mapGetters([]),
		...mapState({
			errorMessage: (state) => state.messages.loginFailed,
		}),
	},
	methods: {
		...mapActions(["login"]),
	},
};
</script>

<style scoped>
.wrapper {
	background: #ffffff;
	/* fallback for old browsers */
	/* background: -webkit-linear-gradient(to right, #4892ee, #2261c0); */
	/* Chrome 10-25, Safari 5.1-6 */
	/* background: linear-gradient(to right, #4892ee, #2261c0); */
	/* background: linear-gradient(90deg, #1cb5e0 0%, #000851 100%); */
	/* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
.logo {
	margin: 8%;
	height: 300px;
	width: auto;
	border-radius: 8%;
}
</style>
