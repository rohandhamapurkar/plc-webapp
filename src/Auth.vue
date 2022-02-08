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
				<button class="form-action" @click="loginUser">Login</button>
				<button class="form-action" @click="loginUser">Register</button>
			</div>
		</div>

		<v-overlay :value="loaderDialog" :z-index="100">
			<v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
		</v-overlay>
	</div>
</template>

<script>
import { required, email } from "vuelidate/lib/validators";
import { mapActions } from "vuex";
import packageJson from "../package.json";
export default {
	name: "Auth",
	components: {},
	created() {},
	mounted() {},
	data: () => ({
		showError: false,
		errorText: false,
		email: "",
		password: "",
		loaderDialog: false,
		version: packageJson.version,
	}),
	methods: {
		...mapActions(["login"]),
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
					username: this.email,
					password: this.password,
				});
				if (!result.ok) {
					this.showError = true;
					this.errorText = "Invalid username or password";
				} else {
					this.$emit("startSession", {});
				}
				this.loaderDialog = false;
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

<style lang="scss" scoped></style>
