import { ActivityType, LocationType, MoodType, PositionType, Language } from '../types';

export const translations = {
  en: {
    appTitle: "IntimDiary",
    encrypted: "ENCRYPTED",

    // Navigation & General
    dashboard: "Dashboard",
    newLog: "New Log",
    history: "History",
    back: "Back",
    cancel: "Cancel",
    saveLog: "Save Log",
    loading: "Loading...",

    // Dashboard
    heroSubtitle: "Wellness Journey",
    heroTitle1: "Mindful",
    heroTitle2: "Intimacy",
    totalEntries: "Total Entries",
    avgDuration: "Avg Duration",
    topPosition: "Top Position",
    min: "min",

    // AI Section
    aiTitle: "AI Insights",
    updateAnalysis: "Update Analysis",
    analyzing: "Analyzing...",
    aiSummary: "Summary",
    aiPatterns: "Patterns",
    aiTip: "Daily Tip",
    aiUnlock: "Unlock personalized insights",
    aiDesc: "Analyze your patterns securely to improve your wellness journey.",
    aiBtn: "Generate Analysis",

    // Charts
    chartsTitle: "Performance & Trends",
    chartPieTitle: "Positions",
    chartPieDesc: "Distribution of positions used",
    chartBarTitle: "Duration",
    chartBarDesc: "Minutes per recent session",
    noData: "No data available yet.",
    logFirst: "Log your first activity to see charts.",

    // History
    noLogs: "No logs yet",
    startTracking: "Start tracking your journey.",
    createFirst: "Create first entry",
    entries: "entries",

    // Log Form
    newEntryTitle: "New Entry",
    details: "Details",
    dateTime: "Date & Time",
    durationLabel: "Duration",
    whoWith: "Who with?",
    where: "Where?",
    partnerName: "Partner Name",
    optional: "Optional...",
    theVibe: "The Vibe",
    positions: "Positions",
    selectMultiple: "Select multiple",
    highlights: "Highlights & Props",
    outcome: "Outcome",
    satisfaction: "Satisfaction",
    climaxReached: "Climax Reached",
    noClimax: "No Climax",
    notes: "Notes (Private)",
    notesPlaceholder: "Private thoughts...",

    // Enum Labels
    activity: {
      [ActivityType.PARTNER]: "Partner",
      [ActivityType.SOLO]: "Solo"
    },
    location: {
      [LocationType.BEDROOM]: "Bedroom",
      [LocationType.LIVING_ROOM]: "Living Room",
      [LocationType.SHOWER]: "Shower/Bath",
      [LocationType.KITCHEN]: "Kitchen",
      [LocationType.OUTDOORS]: "Outdoors",
      [LocationType.OTHER]: "Other"
    },
    mood: {
      [MoodType.PASSIONATE]: "Passionate",
      [MoodType.TENDER]: "Tender",
      [MoodType.ROUGH]: "Rough",
      [MoodType.PLAYFUL]: "Playful",
      [MoodType.TIRED]: "Tired",
      [MoodType.QUICKIE]: "Quickie"
    },
    position: {
      [PositionType.MISSIONARY]: "Missionary",
      [PositionType.DOGGY_STYLE]: "Doggy Style",
      [PositionType.COWGIRL]: "Cowgirl",
      [PositionType.REVERSE_COWGIRL]: "Reverse Cowgirl",
      [PositionType.SPOONING]: "Spooning",
      [PositionType.STANDING]: "Standing",
      [PositionType.ORAL]: "Oral",
      [PositionType.SIXTY_NINE]: "69",
      [PositionType.OTHER]: "Other"
    },
    tags: {
      'Music': 'Music',
      'Toys': 'Toys',
      'Lube': 'Lube',
      'Massage': 'Massage',
      'Candles': 'Candles',
      'Blindfold': 'Blindfold',
      'Spontaneous': 'Spontaneous'
    }
  },
  zh: {
    appTitle: "IntimDiary",
    encrypted: "已加密",

    // Navigation & General
    dashboard: "仪表盘",
    newLog: "新记录",
    history: "历史记录",
    back: "返回",
    cancel: "取消",
    saveLog: "保存记录",
    loading: "加载中...",

    // Dashboard
    heroSubtitle: "健康旅程",
    heroTitle1: "正念",
    heroTitle2: "亲密关系",
    totalEntries: "总记录数",
    avgDuration: "平均时长",
    topPosition: "最爱体位",
    min: "分钟",

    // AI Section
    aiTitle: "AI 洞察",
    updateAnalysis: "更新分析",
    analyzing: "分析中...",
    aiSummary: "摘要",
    aiPatterns: "模式",
    aiTip: "每日建议",
    aiUnlock: "解锁个性化洞察",
    aiDesc: "安全地分析您的行为模式，提升亲密健康。",
    aiBtn: "生成分析报告",

    // Charts
    chartsTitle: "表现与趋势",
    chartPieTitle: "体位分布",
    chartPieDesc: "使用的体位偏好",
    chartBarTitle: "时长趋势",
    chartBarDesc: "近期时长的变化",
    noData: "暂无数据",
    logFirst: "记录第一次活动以查看图表。",

    // History
    noLogs: "暂无记录",
    startTracking: "开始记录您的旅程。",
    createFirst: "创建第一条记录",
    entries: "条记录",

    // Log Form
    newEntryTitle: "新建记录",
    details: "详细信息",
    dateTime: "日期与时间",
    durationLabel: "持续时长",
    whoWith: "和谁？",
    where: "地点？",
    partnerName: "伴侣昵称",
    optional: "选填...",
    theVibe: "氛围",
    positions: "体位",
    selectMultiple: "可多选",
    highlights: "亮点与道具",
    outcome: "结果与感受",
    satisfaction: "满意度",
    climaxReached: "达到高潮",
    noClimax: "未达到高潮",
    notes: "备注 (私密)",
    notesPlaceholder: "写下私密的想法...",

    // Enum Labels
    activity: {
      [ActivityType.PARTNER]: "伴侣",
      [ActivityType.SOLO]: "独处"
    },
    location: {
      [LocationType.BEDROOM]: "卧室",
      [LocationType.LIVING_ROOM]: "客厅",
      [LocationType.SHOWER]: "浴室/淋浴",
      [LocationType.KITCHEN]: "厨房",
      [LocationType.OUTDOORS]: "户外",
      [LocationType.OTHER]: "其他"
    },
    mood: {
      [MoodType.PASSIONATE]: "激情",
      [MoodType.TENDER]: "温柔",
      [MoodType.ROUGH]: "粗暴",
      [MoodType.PLAYFUL]: "顽皮",
      [MoodType.TIRED]: "疲惫",
      [MoodType.QUICKIE]: "速战速决"
    },
    position: {
      [PositionType.MISSIONARY]: "传教士",
      [PositionType.DOGGY_STYLE]: "后入式",
      [PositionType.COWGIRL]: "女上位",
      [PositionType.REVERSE_COWGIRL]: "反向女上位",
      [PositionType.SPOONING]: "侧卧/勺子",
      [PositionType.STANDING]: "站立",
      [PositionType.ORAL]: "口交",
      [PositionType.SIXTY_NINE]: "69式",
      [PositionType.OTHER]: "其他"
    },
    tags: {
      'Music': '音乐',
      'Toys': '玩具',
      'Lube': '润滑液',
      'Massage': '按摩',
      'Candles': '蜡烛',
      'Blindfold': '眼罩',
      'Spontaneous': '即兴'
    }
  }
};