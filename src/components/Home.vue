<template>
	<v-container style="max-width: 100% !important" grid-list-md>
		<v-layout text-xs-center wrap>
			<v-flex mb-4 xs12>
				<h1 class="display-1 font-weight-Medium mb-3">Welcome to PLC</h1>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	components: {},
	data: () => ({}),
	created() {
		console.log(this.$auth);
	},
	methods: {},
	computed: {},
	mounted() {},
};
</script>

<style scoped>
.small {
	max-width: 300px;
	margin: 0px auto;
}

.top-card-styling {
	min-height: 338px;
	border: 1px solid #dcdcdc;
	border-radius: 8px;
}

.card-styling {
	min-height: 320px;
	box-shadow: 0px 6px 18px 0px hsla(0, 0%, 0%, 0.2);
	border-radius: 8px;
}

.container {
	max-width: 800px;
	margin: 0 auto;
}

.bar-chart-container {
	max-width: 600px;
	margin: 0px auto;
}

.btn-wrap {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: flex-end;
}
</style>
