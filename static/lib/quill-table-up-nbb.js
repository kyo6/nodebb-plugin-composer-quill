'use strict';

/**
 * quill-table-up 的 RequireJS 封装：注册格式/模块，并提供与 quill-editor editor.js 对齐的 Snow 配置（含子模块）。
 */
define('quill-table-up-nbb', ['quill', 'quill-table-up'], (Quill, pkg) => {
	const TableUp = pkg.default || pkg.TableUp;
	const defaultCustomSelect = pkg.defaultCustomSelect;
	const {
		TableAlign,
		TableVirtualScrollbar,
		TableResizeLine,
		TableResizeScale,
		TableSelection,
		tableMenuTools,
		TableMenuContextmenu,
	} = pkg;

	const TABLE_UP_TEXTS_ZH = {
		fullCheckboxText: '插入满宽表格',
		customBtnText: '自定义行列数',
		confirmText: '确认',
		cancelText: '取消',
		rowText: '行数',
		colText: '列数',
		notPositiveNumberError: '请输入正整数',
		custom: '自定义',
		clear: '清除',
		transparent: '透明',
		perWidthInsufficient:
			'百分比宽度不足。若继续操作，需要转为固定宽度，是否继续？',
		CopyCell: '复制单元格',
		CutCell: '剪切单元格',
		InsertTop: '向上插入一行',
		InsertRight: '向右插入一列',
		InsertBottom: '向下插入一行',
		InsertLeft: '向左插入一列',
		MergeCell: '合并单元格',
		SplitCell: '拆分单元格',
		DeleteRow: '删除当前行',
		DeleteColumn: '删除当前列',
		DeleteTable: '删除当前表格',
		BackgroundColor: '设置背景颜色',
		BorderColor: '设置边框颜色',
		SwitchWidth: '切换表格宽度',
		InsertCaption: '插入表格标题',
		ToggleTdBetweenTh: '切换表头单元格',
		ConvertTothead: '转换为表头',
		ConvertTotfoot: '转换为表尾',
	};

	const TABLE_UP_ICON =
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm0 5h18M10 3v18"/></svg>';

	const DEFAULT_COLOR_MAP = [
		[
			'rgb(255, 255, 255)',
			'rgb(0, 0, 0)',
			'rgb(72, 83, 104)',
			'rgb(41, 114, 244)',
			'rgb(0, 163, 245)',
			'rgb(49, 155, 98)',
			'rgb(222, 60, 54)',
			'rgb(248, 136, 37)',
			'rgb(245, 196, 0)',
			'rgb(153, 56, 215)',
		],
		[
			'rgb(242, 242, 242)',
			'rgb(127, 127, 127)',
			'rgb(243, 245, 247)',
			'rgb(229, 239, 255)',
			'rgb(229, 246, 255)',
			'rgb(234, 250, 241)',
			'rgb(254, 233, 232)',
			'rgb(254, 243, 235)',
			'rgb(254, 249, 227)',
			'rgb(253, 235, 255)',
		],
	];

	function buildTableUpModules() {
		return [
			{ module: TableVirtualScrollbar },
			{ module: TableAlign },
			{ module: TableResizeLine },
			{
				module: TableResizeScale,
				options: { blockSize: 12, offset: 6 },
			},
			{
				module: TableSelection,
				options: { selectColor: '#00ff8b4d' },
			},
			{
				module: TableMenuContextmenu,
				options: {
					localstorageKey: 'used-color',
					tipText: true,
					tools: [
						tableMenuTools.InsertCaption,
						tableMenuTools.InsertTop,
						tableMenuTools.InsertRight,
						tableMenuTools.InsertBottom,
						tableMenuTools.InsertLeft,
						tableMenuTools.Break,
						tableMenuTools.MergeCell,
						tableMenuTools.SplitCell,
						tableMenuTools.Break,
						tableMenuTools.DeleteRow,
						tableMenuTools.DeleteColumn,
						tableMenuTools.DeleteTable,
						tableMenuTools.Break,
						tableMenuTools.BackgroundColor,
						tableMenuTools.BorderColor,
						tableMenuTools.Break,
						tableMenuTools.CopyCell,
						tableMenuTools.CutCell,
						tableMenuTools.Break,
						tableMenuTools.SwitchWidth,
						tableMenuTools.Break,
						tableMenuTools.ToggleTdBetweenTh,
						tableMenuTools.ConvertTothead,
						tableMenuTools.ConvertTotfoot,
					],
					defaultColorMap: DEFAULT_COLOR_MAP,
				},
			},
		];
	}

	function ensureTableUpRegistered() {
		Quill.register({ [`modules/${TableUp.moduleName}`]: TableUp }, true);
		return TableUp;
	}

	function getTableUpModuleOptions() {
		return {
			full: false,
			autoMergeCell: true,
			fullSwitch: true,
			icon: TABLE_UP_ICON,
			customSelect: defaultCustomSelect,
			customBtn: true,
			modules: buildTableUpModules(),
			texts: TABLE_UP_TEXTS_ZH,
		};
	}

	return {
		ensureTableUpRegistered,
		getTableUpModuleOptions,
		TableUp,
	};
});
