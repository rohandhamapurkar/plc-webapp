<template>
	<div class="authWrapper">
		<div class="logo-wrapper"></div>
		<div class="auth-input-wrapper">
			<div class="form-title">PLC Webapp {{ version }}</div>
			<div class="auth-form">
				<input v-model="email" class="form-input" placeholder="Email ID" type="text" />
				<input v-model="password" class="form-input" placeholder="Password" type="password" />
				<div v-show="showError" class="error-container">
					{{ errorText }}
				</div>
				<div class="action-button">
					<button class="form-action" @click="loginUser">Login</button>
					<v-spacer />
					<button class="form-action" @click="registerUser">Register</button>
				</div>
			</div>
		</div>

		<v-overlay :value="loaderDialog" :z-index="100">
			<v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
		</v-overlay>

		<v-snackbar v-model="localSnackbarState" multi-line light top right :timeout="snackbarTime">
			<div class="snackbarComponentWrapper">
				<div class="content">{{ snackbarText }}</div>
				<div class="action-button">
					<v-btn small fab color="accent" text @click.stop="closeSnackbar">
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</div>
			</div>
		</v-snackbar>
	</div>
</template>

<script>
import { required, email } from "vuelidate/lib/validators";
import { mapActions, mapMutations, mapGetters } from "vuex";
import packageJson from "../package.json";
export default {
	name: "Auth",
	components: {},
	created() {},
	mounted() {},
	data: () => ({
		showError: false,
		localSnackbarState: false,
		errorText: false,
		email: "",
		password: "",
		loaderDialog: false,
		version: packageJson.version,
	}),
	methods: {
		...mapActions(["login", "register"]),
		...mapMutations(["openSnackbar", "closeSnackbar"]),
		/*
		 * validates the input when the login button is pressed and intiates login for the user.
		 * if successful then emits startSession
		 * else provides appropriate error
		 */
		async loginUser() {
			this.showError = false;
			this.$v.$touch();
			if (this.$v.$invalid) {
				if (this.$v.email.$invalid) {
					this.errorText = "Please enter a valid email";
				} else if (this.$v.password.$invalid) {
					this.errorText = "Please enter a password";
				}
				this.showError = true;
			} else {
				// make login api call here
				this.loaderDialog = true;
				let result = await this.login({
					email: this.email,
					password: this.password,
				});
				if (!result.ok) {
					this.showError = true;
					this.errorText = "Invalid email or password";
				} else {
					this.$emit("startSession", {});
				}
				this.loaderDialog = false;
			}
		},

		async registerUser() {
			this.showError = false;
			this.$v.$touch();
			if (this.$v.$invalid) {
				if (this.$v.email.$invalid) {
					this.errorText = "Please enter a valid email";
				} else if (this.$v.password.$invalid) {
					this.errorText = "Please enter a password";
				}
				this.showError = true;
			} else {
				// make login api call here
				this.loaderDialog = true;
				let result = await this.register({
					email: this.email,
					password: this.password,
				});
				if (!result.ok) {
					this.showError = true;
					this.errorText = "Registration failed";
				} else {
					console.log("here");
					this.openSnackbar({ text: "Successfully registered use the same credentials to log in" });
				}
				this.loaderDialog = false;
			}
		},
	},
	computed: {
		...mapGetters(["snackbarState", "snackbarText", "snackbarTime"]),
	},
	watch: {
		snackbarState(nv) {
			this.localSnackbarState = nv;
		},
		localSnackbarState(nv) {
			if (!nv) {
				this.closeSnackbar();
			}
		},
	},
	validations: {
		email: {
			required,
			email,
		},
		password: {
			required,
		},
	},
};
</script>

<style lang="scss" scoped>
.action-button {
	display: flex;
	flex-direction: row;
}
</style>
