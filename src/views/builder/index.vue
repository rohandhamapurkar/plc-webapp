<template>
	<div class="enhance-wrapper default-page-padding">
		<div v-if="selectedRender" class="render-enhance-wrapper">
			<div class="render-enhance-canvas-wrapper">
				<CanvasWrapper :selectedRender="selectedRender" />
			</div>
			<div class="render-enhance-canvas-editor-wrapper">
				<CanvasEditorWrapper />
			</div>
		</div>
		<div v-else></div>
	</div>
</template>

<script>
import CanvasWrapper from "@/components/canvas/CanvasWrapper.vue";
import CanvasEditorWrapper from "@/components/canvas/CanvasEditorWrapper.vue";

export default {
	components: {
		CanvasWrapper,
		CanvasEditorWrapper,
	},
	mounted() {},
	created() {},
	data: () => ({
		// selectedRender: false,
		selectedRender: {
			imageUrl:
				"https://images.unsplash.com/photo-1532153955177-f59af40d6472?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3087&q=80",
			dimension: { width: "3087", height: "4628" },
		},
	}),
	methods: {},
};
</script>

<style lang="scss" scoped>
.render-enhance-wrapper {
	display: flex;
	justify-content: space-between;
}
.render-enhance-canvas-wrapper {
	flex-basis: 70%;
}
.render-enhance-canvas-editor-wrapper {
	flex: 0 0 30%;
	display: flex;
	.canvas-editor-wrapper {
		margin: 0 auto;
		width: 80%;
	}
}
</style>
