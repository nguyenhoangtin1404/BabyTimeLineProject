function app() {
  // ===== Helpers =====
  const toMinutes = (hhmm) => {
    const [h, m] = (hhmm || "00:00").split(":").map(Number);
    return (h * 60 + (m || 0)) % (24 * 60);
  };
  const pad = (n) => String(n).padStart(2, "0");
  const formatHHMM = (d = new Date()) =>
    `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const formatHHMMSS = (d = new Date()) =>
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const isNowInRange = (nowMin, startMin, endMin) => {
    if (startMin <= endMin) return nowMin >= startMin && nowMin < endMin;
    return nowMin >= startMin || nowMin < endMin; // cross midnight
  };
  const normalize = (arr = []) =>
    arr.map((item, idx) => ({
      id: item.id || `${item.start}-${idx}-${item.label}`,
      ...item,
      _start: toMinutes(item.start),
      _end: toMinutes(item.end),
    }));
  const viDay = (d) =>
    ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][
      d.getDay()
    ];
  const prettyDate = (d = new Date()) =>
    `${viDay(d)}, ${pad(d.getDate())}/${pad(
      d.getMonth() + 1
    )}/${d.getFullYear()}`;

  // ===== Presets =====
  const PRESETS = {
    "Happy School – Lớp Kitty": [
      { start: "07:15", end: "08:00", label: "Đón trẻ & HĐ cá nhân" },
      { start: "08:00", end: "08:20", label: "Thể dục buổi sáng/Yoga" },
      {
        start: "08:20",
        end: "08:40",
        label: "Điểm danh – Chào hỏi – Ổn định nề nếp",
      },
      {
        start: "08:40",
        end: "09:00",
        label: "Hoạt động học (Văn học/Tạo hình/KN/STEAM)",
      },
      {
        start: "09:00",
        end: "09:30",
        label: "Hoạt động ngoài trời – Chơi tự do",
      },
      { start: "09:30", end: "10:20", label: "Chơi – Hoạt động ở các góc" },
      { start: "10:20", end: "11:15", label: "Ăn trưa" },
      {
        start: "11:15",
        end: "11:30",
        label: "Vệ sinh – Kể chuyện trước giờ ngủ",
      },
      { start: "11:30", end: "13:45", label: "Ngủ trưa" },
      {
        start: "14:00",
        end: "14:30",
        label: "Vệ sinh cá nhân – Vận động nhẹ – Ăn xế",
      },
      {
        start: "14:30",
        end: "15:00",
        label: "Hoạt động chiều (Sensory/STEAM/THCS)",
      },
      {
        start: "15:00",
        end: "15:30",
        label: "Âm nhạc/Ngôn ngữ – warm up & ôn tập",
      },
      { start: "15:30", end: "16:00", label: "Chia sẻ vòng tròn/Đọc sách" },
      { start: "16:00", end: "16:30", label: "Uống sữa chiều – Vệ sinh" },
      {
        start: "16:30",
        end: "17:30",
        label: "Trả trẻ – Hoạt động kết thúc ngày",
      },
    ],
    "EASY NB (0–6 tuần)": [
      { start: "06:00", end: "06:30", label: "Ăn/bú" },
      { start: "06:30", end: "07:15", label: "Thay tã + Ôm ấp" },
      { start: "07:15", end: "08:30", label: "Ngủ" },
      { start: "08:30", end: "09:00", label: "Ăn/bú" },
      { start: "09:00", end: "10:00", label: "Tỉnh/skin-to-skin" },
      { start: "10:00", end: "11:00", label: "Ngủ" },
      { start: "11:00", end: "11:30", label: "Ăn/bú" },
      { start: "11:30", end: "13:00", label: "Ngủ" },
      { start: "13:00", end: "13:30", label: "Ăn/bú" },
      { start: "13:30", end: "15:00", label: "Ngủ" },
      { start: "15:00", end: "15:30", label: "Ăn/bú" },
      { start: "15:30", end: "17:00", label: "Ngủ" },
      { start: "17:00", end: "17:30", label: "Ăn/bú" },
      { start: "17:30", end: "19:00", label: "Ngủ/nghỉ" },
      { start: "19:00", end: "19:30", label: "Tắm + Ăn" },
      { start: "19:30", end: "22:30", label: "Ngủ đêm" },
      { start: "22:30", end: "23:00", label: "Bú đêm (tùy)" },
      { start: "23:00", end: "06:00", label: "Ngủ đêm" },
    ],
    "EASY 1 (0–3 tháng)": [
      { start: "06:30", end: "07:00", label: "Ăn (bú/ăn sáng)" },
      { start: "07:00", end: "08:00", label: "Chơi/hoạt động nhẹ" },
      { start: "08:00", end: "09:30", label: "Ngủ" },
      { start: "09:30", end: "10:00", label: "Ăn" },
      { start: "10:00", end: "11:00", label: "Chơi" },
      { start: "11:00", end: "12:30", label: "Ngủ" },
      { start: "12:30", end: "13:00", label: "Ăn" },
      { start: "13:00", end: "14:00", label: "Chơi" },
      { start: "14:00", end: "15:30", label: "Ngủ" },
      { start: "15:30", end: "16:00", label: "Ăn" },
      { start: "16:00", end: "17:00", label: "Chơi" },
      { start: "17:00", end: "18:00", label: "Chợp mắt ngắn" },
      { start: "18:00", end: "19:00", label: "Tắm + Ăn" },
      { start: "19:00", end: "22:30", label: "Ngủ đêm" },
      { start: "22:30", end: "23:00", label: "Bú đêm (tùy chọn)" },
      { start: "23:00", end: "06:30", label: "Ngủ đêm" },
    ],
    "EASY 2 (4–6 tháng)": [
      { start: "06:30", end: "07:00", label: "Ăn" },
      { start: "07:00", end: "08:45", label: "Chơi/hoạt động" },
      { start: "08:45", end: "10:15", label: "Ngủ" },
      { start: "10:15", end: "10:45", label: "Ăn" },
      { start: "10:45", end: "12:30", label: "Chơi" },
      { start: "12:30", end: "14:00", label: "Ngủ" },
      { start: "14:00", end: "14:30", label: "Ăn" },
      { start: "14:30", end: "16:15", label: "Chơi" },
      { start: "16:15", end: "17:00", label: "Chợp mắt" },
      { start: "17:00", end: "17:30", label: "Ăn nhẹ" },
      { start: "17:30", end: "19:00", label: "Thư giãn/chuẩn bị ngủ" },
      { start: "19:00", end: "22:30", label: "Ngủ đêm" },
      { start: "22:30", end: "23:00", label: "Bú đêm (tùy chọn)" },
      { start: "23:00", end: "06:30", label: "Ngủ đêm" },
    ],
    "EASY 3 (7–9 tháng)": [
      { start: "06:30", end: "07:00", label: "Ăn" },
      { start: "07:00", end: "09:30", label: "Chơi" },
      { start: "09:30", end: "11:00", label: "Ngủ (giấc 1)" },
      { start: "11:00", end: "11:30", label: "Ăn" },
      { start: "11:30", end: "14:00", label: "Chơi" },
      { start: "14:00", end: "15:30", label: "Ngủ (giấc 2)" },
      { start: "15:30", end: "16:00", label: "Ăn" },
      { start: "16:00", end: "19:00", label: "Chơi" },
      { start: "19:00", end: "22:30", label: "Ngủ đêm" },
      { start: "22:30", end: "23:00", label: "Bú đêm (tùy chọn)" },
      { start: "23:00", end: "06:30", label: "Ngủ đêm" },
    ],
    "EASY 4 (10–12 tháng)": [
      { start: "06:30", end: "07:00", label: "Ăn sáng" },
      { start: "07:00", end: "09:30", label: "Chơi/hoạt động" },
      { start: "09:30", end: "11:15", label: "Ngủ (giấc 1)" },
      { start: "11:15", end: "11:45", label: "Ăn trưa" },
      { start: "11:45", end: "15:00", label: "Chơi/ra ngoài" },
      { start: "15:00", end: "16:30", label: "Ngủ (giấc 2)" },
      { start: "16:30", end: "17:00", label: "Ăn nhẹ" },
      { start: "17:00", end: "19:00", label: "Chơi nhẹ" },
      { start: "19:00", end: "19:30", label: "Tắm + Ăn tối" },
      { start: "19:30", end: "06:30", label: "Ngủ đêm" },
    ],
    "EASY 5 (12–18 tháng)": [
      { start: "06:30", end: "07:00", label: "Thức dậy + Ăn sáng" },
      { start: "07:00", end: "10:00", label: "Chơi/hoạt động" },
      { start: "10:00", end: "11:30", label: "Ngủ (giấc 1)" },
      { start: "11:30", end: "12:00", label: "Ăn trưa" },
      { start: "12:00", end: "15:30", label: "Chơi" },
      { start: "15:30", end: "16:30", label: "Ngủ (giấc 2 ngắn)" },
      { start: "16:30", end: "18:00", label: "Chơi" },
      { start: "18:00", end: "18:30", label: "Ăn tối + Tắm" },
      { start: "18:30", end: "06:30", label: "Ngủ đêm" },
    ],
    "EASY 6 (18–24 tháng)": [
      { start: "06:30", end: "07:00", label: "Thức dậy + Ăn sáng" },
      { start: "07:00", end: "11:30", label: "Chơi/hoạt động" },
      { start: "11:30", end: "13:30", label: "Ngủ trưa (1 giấc)" },
      { start: "13:30", end: "16:30", label: "Chơi" },
      { start: "16:30", end: "17:00", label: "Ăn nhẹ" },
      { start: "17:00", end: "19:30", label: "Chơi nhẹ" },
      { start: "19:30", end: "20:00", label: "Tắm + Chuẩn bị ngủ" },
      { start: "20:00", end: "06:30", label: "Ngủ đêm" },
    ],
    "EASY Toddler (2–3 tuổi)": [
      { start: "06:30", end: "07:00", label: "Thức dậy + Ăn sáng" },
      { start: "07:00", end: "12:00", label: "Học/chơi/ra ngoài" },
      { start: "12:00", end: "12:30", label: "Ăn trưa" },
      { start: "12:30", end: "14:00", label: "Ngủ trưa" },
      { start: "14:00", end: "17:30", label: "Chơi/hoạt động" },
      { start: "17:30", end: "18:30", label: "Tắm + Ăn tối" },
      { start: "18:30", end: "20:30", label: "Chơi nhẹ/đọc sách" },
      { start: "20:30", end: "06:30", label: "Ngủ đêm" },
    ],
    "Lịch đi học ở trường": [
      { start: "06:30", end: "07:15", label: "Thức dậy + Ăn sáng" },
      { start: "07:15", end: "07:45", label: "Chuẩn bị + Đến trường" },
      { start: "07:45", end: "11:15", label: "Học ở lớp/hoạt động sáng" },
      { start: "11:15", end: "12:45", label: "Ăn trưa + Ngủ trưa" },
      { start: "12:45", end: "16:30", label: "Học/Chơi chiều" },
      { start: "16:30", end: "17:30", label: "Đón về + Nghỉ ngơi" },
      { start: "17:30", end: "18:30", label: "Tắm + Ăn tối" },
      { start: "18:30", end: "19:30", label: "Chơi nhẹ/đọc sách" },
      { start: "19:30", end: "20:30", label: "Chuẩn bị ngủ" },
      { start: "20:30", end: "06:30", label: "Ngủ đêm" },
    ],
  };

  return {
    // ===== State =====
    settingsOpen: false,

    presetNames: Object.keys(PRESETS),
    selectedPreset:
      localStorage.getItem("preset") || "Happy School – Lớp Kitty",
    weeklyMode: JSON.parse(localStorage.getItem("weeklyMode") || "false"),
    weeklyMap: JSON.parse(
      localStorage.getItem("weeklyMap") ||
        JSON.stringify({
          weekday: "Happy School – Lớp Kitty",
          weekend: "EASY Toddler (2–3 tuổi)",
        })
    ),
    customSchedules: JSON.parse(
      localStorage.getItem("customSchedules") || "{}"
    ),
    notifyEnabled: JSON.parse(localStorage.getItem("notifyEnabled") || "false"),
    soundEnabled: JSON.parse(localStorage.getItem("soundEnabled") || "true"),

    // Pre-alert settings
    preAlertEnabled: JSON.parse(
      localStorage.getItem("preAlertEnabled") || "true"
    ),
    preAlertMinutes: Number(localStorage.getItem("preAlertMinutes") || 5),
    preAlertFiredMap: {},
    _preAlertLoadedKey: "",

    nowHHMM: formatHHMM(new Date()),
    nowHHMMSS: formatHHMMSS(new Date()),
    datePretty: prettyDate(new Date()),
    doneMap: {},

    editorOpen: false,
    editorPreset: "",
    editing: [],
    dragFromIdx: null,

    // theo dõi thay đổi khung giờ/preset giữa các tick
    lastSlotId: null,
    _lastPresetName: "",

    // Progress view (animated number & width)
    progressView: 0,
    progressBoost: false,

    // ===== Computed =====
    get activePresetName() {
      const dow = new Date().getDay(); // 0=CN
      const isWeekday = dow >= 1 && dow <= 5;
      this.isWeekday = isWeekday;
      return this.weeklyMode
        ? isWeekday
          ? this.weeklyMap.weekday
          : this.weeklyMap.weekend
        : this.selectedPreset;
    },
    get activeSchedule() {
      const base =
        this.customSchedules[this.activePresetName] ||
        PRESETS[this.activePresetName] ||
        [];
      const sorted = [...base].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start)
      );
      return normalize(sorted);
    },
    get currentIndex() {
      // reactive to the ticking clock
      this.nowHHMM;
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      return this.activeSchedule.findIndex((s) =>
        isNowInRange(nowMin, s._start, s._end)
      );
    },
    get currentSlot() {
      return this.currentIndex >= 0
        ? this.activeSchedule[this.currentIndex]
        : null;
    },
    get nextSlot() {
      const list = this.activeSchedule;
      if (!list.length) return null;
      // re-compute mỗi giây theo đồng hồ
      this.nowHHMM;
      if (this.currentIndex >= 0) {
        return list[(this.currentIndex + 1) % list.length];
      }
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      // đang ở khoảng trống giữa 2 khung -> tìm khung có start >= now; nếu không có thì lấy khung đầu tiên ngày mai
      const future = list.find((s) => s._start >= nowMin);
      return future || list[0];
    },
    get progress() {
      const total = Math.max(this.activeSchedule.length, 1);
      const done = Object.values(this.doneMap).filter(Boolean).length;
      return Math.round((done / total) * 100);
    },
    get minutesToNext() {
      // depend on reactive clock to update
      this.nowHHMM;
      if (!this.nextSlot) return 0;
      return this._minutesUntil(this.nextSlot._start);
    },

    // ===== Methods =====
    init() {
      this.ensurePresetValid();
      // initial load
      this.editorPreset = this.activePresetName;
      this._lastPresetName = this.activePresetName;
      this.loadEditing();
      this.loadDoneMap();
      this.loadPreAlertMap();
      // auto check các mục đã qua giờ (khi mở app/đổi preset)
      this.autoCheckPastSlots();
      this.lastSlotId = this.currentSlot?.id || null;

      // set initial progress view
      this.progressView = this.progress;

      // watcher: when computed progress changes -> tween the bar & number
      this.$watch("progress", (val, old) => this._tweenProgress(val, old));

      // after mount: focus current item
      setTimeout(() => this.scrollToCurrent(), 80);

      // reactive watcher: preset thay đổi -> refresh ngay không chờ timer
      this.$watch(
        () => this.activePresetName,
        (val, old) => {
          if (val === old) return;
          this._lastPresetName = val;
          this.loadDoneMap();
          this.loadPreAlertMap();
          // auto check các mục đã qua giờ (khi mở app/đổi preset)
          this.autoCheckPastSlots();
          this._tweenProgress(this.progress, this.progressView);
          this.scrollToCurrent();
        }
      );

      // ticker every second for smooth clock + pre-alert checks
      setInterval(() => {
        const now = new Date();
        this.nowHHMM = formatHHMM(now);
        this.nowHHMMSS = formatHHMMSS(now);
        this.datePretty = prettyDate(now);

        // preset change (midnight or mapping) -> reload
        if (this.activePresetName !== this._lastPresetName) {
          this._lastPresetName = this.activePresetName;
          this.loadDoneMap();
          this.loadPreAlertMap();
          // auto check các mục đã qua giờ (khi mở app/đổi preset)
          this.autoCheckPastSlots();
          // also update visual progress smoothly to new baseline
          this._tweenProgress(this.progress, this.progressView);
          this.scrollToCurrent();
        }

        // entering a new slot
        const curId = this.currentSlot?.id || null;
        if (curId !== this.lastSlotId) {
          // Auto-mark slot vừa kết thúc là hoàn thành
          const prev = this.lastSlotId;
          if (prev && !this.doneMap[prev]) {
            this.doneMap[prev] = true;
            this.saveDoneMap();
          }
          if (this.notifyEnabled && curId) this.fireNotify(this.currentSlot);
          this.scrollToCurrent();
          this.lastSlotId = curId;
        }

        // pre-alert X minutes before next slot start
        if (this.notifyEnabled && this.preAlertEnabled && this.nextSlot) {
          const delta = this._minutesUntil(this.nextSlot._start);
          if (
            delta === Number(this.preAlertMinutes) &&
            !this.preAlertFiredMap[this.nextSlot.id]
          ) {
            this.firePreAlert(this.nextSlot);
            this.preAlertFiredMap[this.nextSlot.id] = true;
            this.savePreAlertMap();
          }
        }

        // midnight: reset checklist for new day
        if (this.nowHHMM === "00:00" && now.getSeconds() < 2) {
          this.loadDoneMap();
          this._tweenProgress(this.progress, this.progressView);
        }
      }, 1000);
    },

    // tween progress number & width with easing
    _tweenProgress(target, old) {
      target = Math.max(0, Math.min(100, Number(target) || 0));
      const start = Number(this.progressView) || 0;
      const dist = target - start;
      if (Math.abs(dist) < 0.5) {
        this.progressView = target;
        return;
      }
      const dur = 550; // ms
      const t0 = performance.now();
      this.progressBoost = true; // subtle glow
      const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        this.progressView = +(start + dist * ease(p)).toFixed(2);
        if (p < 1) requestAnimationFrame(step);
        else setTimeout(() => (this.progressBoost = false), 180);
      };
      requestAnimationFrame(step);
    },

    // persistence helpers
    persist(k, v) {
      localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    },
    todayKey,

    loadDoneMap() {
      const key = `kids-schedule:${todayKey()}:${this.activePresetName}`;
      try {
        this.doneMap = JSON.parse(localStorage.getItem(key) || "{}");
      } catch {
        this.doneMap = {};
      }
    },
    saveDoneMap() {
      const key = `kids-schedule:${todayKey()}:${this.activePresetName}`;
      localStorage.setItem(key, JSON.stringify(this.doneMap));
      // reflect immediately
      this._tweenProgress(this.progress, this.progressView);
    },

    // editor helpers
    toggleEditor() {
      this.editorOpen = !this.editorOpen;
      if (this.editorOpen) {
        this.editorPreset = this.activePresetName;
        this.loadEditing();
      }
    },
    loadEditing() {
      const arr = (
        this.customSchedules[this.editorPreset] ||
        PRESETS[this.editorPreset] ||
        []
      ).map((x, i) => ({ ...x, id: x.id || `${x.start}-${i}-${x.label}` }));
      this.editing = arr;
    },
    addSlot() {
      this.editing.push({
        id: `new-${Date.now()}`,
        start: "08:00",
        end: "08:30",
        label: "Hoạt động mới",
      });
    },
    removeSlot(id) {
      this.editing = this.editing.filter((x) => x.id !== id);
    },
    sortByTime() {
      this.editing = [...this.editing].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start)
      );
    },
    saveEditing() {
      this.customSchedules[this.editorPreset] = this.editing.map((x) => ({
        start: x.start,
        end: x.end,
        label: x.label,
        id: x.id,
      }));
      this.persist("customSchedules", this.customSchedules);
      // refresh active if editing that preset
      this.loadDoneMap();
      this.loadPreAlertMap();
      // auto check các mục đã qua giờ (khi mở app/đổi preset)
      this.autoCheckPastSlots();
      this.$nextTick(() => {
        this.scrollToCurrent();
        this._tweenProgress(this.progress, this.progressView);
      });
    },
    resetToDefault() {
      delete this.customSchedules[this.editorPreset];
      this.persist("customSchedules", this.customSchedules);
      this.loadEditing();
      this.loadPreAlertMap();
      this.$nextTick(() => {
        this.scrollToCurrent();
        this._tweenProgress(this.progress, this.progressView);
      });
    },

    // drag-drop
    onDragStart(idx, ev) {
      this.dragFromIdx = idx;
      ev.dataTransfer.effectAllowed = "move";
    },
    onDragOver(ev) {
      ev.dataTransfer.dropEffect = "move";
      ev.currentTarget.classList.add("drag-over");
    },
    onDrop(toIdx, ev) {
      ev.currentTarget.classList.remove("drag-over");
      const fromIdx = this.dragFromIdx;
      if (fromIdx == null || fromIdx === toIdx) return;
      const arr = [...this.editing];
      const [m] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, m);
      this.editing = arr;
      this.dragFromIdx = null;
    },

    // notifications
    async onToggleNotify() {
      this.persist("notifyEnabled", this.notifyEnabled);
      if (
        this.notifyEnabled &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        try {
          await Notification.requestPermission();
        } catch {}
      }
    },
    playBeep() {
      if (!this.soundEnabled) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.start();
        osc.stop(t + 0.45);
      } catch {}
    },
    fireNotify(slot) {
      if (
        this.notifyEnabled &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("Đến khung giờ", {
            body: `${slot.label} (${slot.start}–${slot.end})`,
          });
        } catch {}
      }
      this.playBeep();
    },
    firePreAlert(slot) {
      if (
        this.notifyEnabled &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("Sắp đến khung giờ", {
            body: `Còn ${this.preAlertMinutes} phút: ${slot.label} (${slot.start}–${slot.end})`,
          });
        } catch {}
      }
      this.playBeep();
    },
    testNotify() {
      this.playBeep();
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("Thử thông báo", {
            body: "Ví dụ: Đến giờ Ăn sáng (06:30–07:00)",
          });
        } catch {}
      }
    },

    // pre-alert helpers
    getPreAlertKey() {
      return `preAlertFired:${todayKey()}:${this.activePresetName}`;
    },
    loadPreAlertMap() {
      const key = this.getPreAlertKey();
      try {
        this.preAlertFiredMap = JSON.parse(localStorage.getItem(key) || "{}");
      } catch {
        this.preAlertFiredMap = {};
      }
      this._preAlertLoadedKey = key;
    },
    savePreAlertMap() {
      localStorage.setItem(
        this.getPreAlertKey(),
        JSON.stringify(this.preAlertFiredMap)
      );
    },
    _minutesUntil(startMin) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      return startMin >= nowMin
        ? startMin - nowMin
        : 24 * 60 - nowMin + startMin;
    },

    // checklist helpers
    resetToday() {
      this.doneMap = {};
      this.saveDoneMap();
    },
    toggleDone(id) {
      this.doneMap[id] = !this.doneMap[id];
      this.saveDoneMap();
    },

    // auto check những slot đã qua giờ
    autoCheckPastSlots() {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      let changed = false;
      for (const s of this.activeSchedule) {
        if (isNowInRange(nowMin, s._start, s._end)) continue; // đang diễn ra -> không check
        if (s._start <= s._end) {
          // bình thường trong ngày
          if (nowMin >= s._end && !this.doneMap[s.id]) {
            this.doneMap[s.id] = true;
            changed = true;
          }
        } else {
          // qua nửa đêm: chỉ xem là "đã qua" nếu đang ở buổi sáng sau khi kết thúc (now < start)
          if (nowMin < s._start && nowMin >= s._end && !this.doneMap[s.id]) {
            this.doneMap[s.id] = true;
            changed = true;
          }
        }
      }
      if (changed) this.saveDoneMap();
    },

    // preset validity helper
    ensurePresetValid() {
      if (!PRESETS[this.selectedPreset]) {
        this.selectedPreset = "Happy School – Lớp Kitty";
        this.persist("preset", this.selectedPreset);
      }
    },

    // scroll helper (dọc)
    scrollToCurrent() {
      const el = this.$refs.vScroller;
      if (!el) return;
      const idx = this.currentIndex > -1 ? this.currentIndex : 0;
      const target = document.getElementById(`slot-row-${idx}`);
      if (target && target.scrollIntoView)
        target.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "smooth",
        });
    },
  };
}

/* Weather */
const wx = {
  loadingEl: document.getElementById("wxLoading"),
  contentEl: document.getElementById("wxContent"),
  errorEl: document.getElementById("wxError"),
  emojiEl: document.getElementById("wxEmoji"),
  tempEl: document.getElementById("wxTemp"),
  textEl: document.getElementById("wxText"),
  updatedEl: document.getElementById("wxUpdated"),
  refreshBtn: document.getElementById("wxRefresh"),
};
function wxMap(code) {
  const M = {
    0: ["Trời quang", "☀️"],
    1: ["Nắng nhẹ", "🌤️"],
    2: ["Ít mây", "⛅"],
    3: ["Nhiều mây", "☁️"],
    45: ["Sương mù", "🌫️"],
    61: ["Mưa nhẹ", "🌧️"],
    63: ["Mưa vừa", "🌧️"],
    65: ["Mưa to", "🌧️"],
    95: ["Dông", "⛈️"],
  };
  return M[code] || ["Thời tiết", "🌤️"];
}
async function fetchWeather(lat, lon) {
  wx.loadingEl.classList.remove("hidden");
  wx.contentEl.classList.add("hidden");
  wx.errorEl.classList.add("hidden");
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
    );
    const data = await res.json();
    const cur = data?.current_weather;
    if (!cur) throw new Error();
    const [text, emoji] = wxMap(Number(cur.weathercode || 0));
    wx.emojiEl.textContent = emoji;
    wx.tempEl.textContent = Math.round(cur.temperature);
    wx.textEl.textContent = text;
    wx.updatedEl.textContent = new Date().toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    wx.loadingEl.classList.add("hidden");
    wx.contentEl.classList.remove("hidden");
  } catch (e) {
    wx.loadingEl.classList.add("hidden");
    wx.errorEl.classList.remove("hidden");
  }
}
function getWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      (_) => fetchWeather(13.0955, 109.3209) // Phú Yên (Tuy Hòa) mặc định
    );
  } else {
    fetchWeather(13.0955, 109.3209); // fallback cũng là Phú Yên
  }
}
getWeather();
setInterval(getWeather, 30 * 60 * 1000);
wx.refreshBtn.addEventListener("click", getWeather);
