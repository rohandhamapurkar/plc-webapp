<template>
	<v-app>
		<div class="authWrapper">
			<div class="logo-wrapper"></div>
			<div class="auth-input-wrapper">
				<div class="form-title">PLC Webapp {{ version }}</div>
				<div class="auth-form">
					<button class="form-action" @click="loginUser">Login with Auth0</button>
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

			<!-- <v-dialog v-model="showOtpDialog" persistent max-width="500" width="500">
				<v-card>
					<v-card-title class="text-h5 grey lighten-2"> Enter Verification Code Sent on email </v-card-title>

					<v-card-text>
						<v-container class="white lighten-2" fluid>
							<v-otp-input type="number" v-model="otp" :length="length" dark></v-otp-input>
						</v-container>
						<v-btn block :disabled="!isActive" @click="sendOtpForVerification">Verify</v-btn>
						<v-btn block @click="showOtpDialog = false">Cancel</v-btn>
					</v-card-text>

					<v-card-actions> </v-card-actions>
				</v-card>
			</v-dialog> -->
		</div>
	</v-app>
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
		showOtpDialog: false,
		version: packageJson.version,
		otp: "",
		length: 6,
	}),
	methods: {
		...mapActions([]),
		...mapMutations(["openSnackbar", "closeSnackbar"]),
		/*
		 * validates the input when the login button is pressed and intiates login for the user.
		 * if successful then emits startSession
		 * else provides appropriate error
		 */
		async loginUser() {
			this.$auth.loginWithRedirect();
		},
	},
	computed: {
		...mapGetters(["snackbarState", "snackbarText", "snackbarTime"]),
		isActive() {
			return this.otp.length === this.length;
		},
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
