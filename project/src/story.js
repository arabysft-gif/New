// story.js — "الرجل الرابع" (Shackleton & the Third Man factor) — Arabic, ~53 s
// Cast/worlds/shots from the three companion libraries; every time comes from the word clock.
import words from "./words.js";
import { buildWorlds } from "./worlds-24.js";
import { addCharacter } from "./characters-52.js";
import { shotList, checkShotList } from "./shots-24.js";
import { prop } from "./engine/index.js";
import { getCharacter } from "./characters-52.js";

export default {
  words,
  captions: true,
  seed: 50,
  shadowMap: 4096,
  inkPx: 9,

  build(a) {
    const { W, aim, aerial, kit, mat, glow, rand, cast, fx, makeLook, clock, THREE, makePalette, tintLight, buildSet, dress, lights } = a;

    // at(): word start, with a safe fallback so a missing word never kills the render
    const at = (w, fb, from = 0) => { try { return clock.at(w, from); } catch { return fb; } };

    // ---- worlds (hybrid builds) ----
    // mountain [0,0] · ocean_storm [60,0] · glacier [120,0] · village [150,0] · cabin [180,0]
    const worlds = buildWorlds(a,
      ["mountain", "ocean_storm", "glacier", "village", "cabin"],
      [[0, 0], [60, 0], [120, 0], [150, 0], [180, 0]], 50);

    // ---- cast (unique names so focus/warnings always point at the right member) ----
    const add = (id, seed, pos, name) => {
      const def = getCharacter(id);
      const c = cast.add({ name, look: makeLook(rand.fork(seed), def.role, def.look), pos, h: def.h, face: def.face });
      c.arms(0, def.arms);
      return c;
    };
    const shack = add("explorer", 7, [1.6, 1.2], "shack");        // Shackleton (mountain)
    const fig4 = add("soldier", 8, [1.9, -1.1], "fig4");          // the fourth man (mountain)
    const climber = add("explorer_f", 11, [7, 4], "climber");     // "متسلقين"
    const bShack = add("explorer", 7, [60, 0], "boat_shack");     // boat: Shackleton
    const bWorsley = add("sailor", 9, [58.8, 0.6], "boat_worsley"); // boat: Worsley
    const bCrean = add("blacksmith", 10, [61.2, 0.6], "boat_crean");
    const wheel = add("sailor", 12, [66, 2], "helmsman");         // "بحارة"
    const gShack = add("explorer", 7, [120, 0], "camp_shack");    // glacier trio
    const gWorsley = add("sailor", 9, [118.7, 0.8], "camp_worsley");
    const gCrean = add("blacksmith", 10, [121.3, 0.8], "camp_crean");
    const fig4b = add("soldier", 8, [121.7, -0.9], "fig4b");      // the fourth man (glacier fire)
    const survivor = add("old_captain", 13, [150, 0], "survivor"); // "ناجين من كوارث"
    const prof = add("professor", 14, [180.3, 0.4], "prof");      // the study

    // ---- the fourth man appears and vanishes (his times, on his words) ----
    const tHasis = at("حاسس", 7.92);
    const tBod = at("بعد", 10.32);
    const tTalata = at("التلاتة", 41.27);
    const tQ1 = at("متسلقين", 45.6);
    fig4.show(tHasis).hide(tBod).show(tTalata).hide(tQ1);
    fig4b.show(tTalata).hide(tQ1);

    // ---- hero props for the macro shots ----
    const pal = (i) => worlds[i].palette;
    prop.table(W, { x: -4.5, y: 0, z: -2.5, pal: pal(0) });                     // mountain: the map table (away from lenses)
    prop.poster(W, { x: -4.5, y: 0.95, z: -2.5, w: 0.8, h: 0.55, pal: pal(0) });  // the unmarked map
    prop.sacks(W, { x: 57.6, y: 0, z: 2.4, pal: pal(1) });                      // boat: supply sacks (aft)
    prop.sacks(W, { x: 118.3, y: 0, z: -1.8, pal: pal(2) });                    // glacier: rope/axe gear pile (behind the fire)
    // camp fire on the glacier (glow ball + practical light, like the world kit does)
    W.add(kit.ball(0.35, glow([2.2, 1.1, 0.3]), { x: 120, y: 0.5, z: 2.2 }), { collide: false, name: "camp_fire" });
    lights.practical({ kind: "pendant", x: 120, y: 0.6, z: 2.2, color: "#ff9a3a", light: true, intensity: 6 });

    // depth dressing: rocks/ice blocks in fore/mid/back so no shot reads flat
    const rock = (x, y, z, s) => {
      const m = mat("stone", { color: "#93a7b4", seed: 3 + Math.round(s * 10), count: 6 });
      W.add(kit.ball(s, m, { x, y, z, detail: 2 }), { name: "rock" });
    };
    // mountain: boulders near the path and far ones for the third layer
    rock(-2.2, 0.2, 1.6, 0.5); rock(2.4, 0.15, -2.0, 0.7); rock(-3.5, 0.3, -3.2, 1.1); rock(4.5, 0.4, 3.8, 1.4);
    rock(-5, 0.2, 2.5, 0.9); rock(3.2, 0.1, -1.2, 0.35);
    // background cluster BEHIND the hook subject (never between camera and face)
    rock(-1.8, 0.2, -1.5, 0.4); rock(1.9, 0.15, -1.8, 0.5); rock(0.2, 0.2, -3.0, 0.8); rock(-2.8, 0.2, -2.4, 0.7);
    // ocean: ice floes around the boat at [60,0]
    rock(57.8, 0.1, 1.8, 0.8); rock(62.2, 0.1, -1.6, 0.6); rock(60, 0.05, 4.2, 1.0); rock(56.2, 0.1, -3.0, 1.2); rock(63.5, 0.1, 2.5, 0.7);
    // glacier: ice blocks + snow mounds around the camp at [120,0]
    rock(117.8, 0.2, 2.0, 0.6); rock(122.5, 0.2, -1.8, 0.8); rock(119.5, 0.15, -2.8, 0.5); rock(123.5, 0.2, 3.2, 1.1); rock(116.5, 0.2, -1.5, 0.9); rock(120.8, 0.1, 1.9, 0.3);
    // cabin study [180,0]: desk, charts and crates so the finale has depth
    prop.table(W, { x: 179.2, y: 0, z: 1.6, pal: pal(4) });
    prop.poster(W, { x: 181.4, y: 1.2, z: 1.0, w: 0.7, h: 0.5, pal: pal(4) });
    prop.poster(W, { x: 178.9, y: 1.1, z: -1.2, w: 0.6, h: 0.45, pal: pal(4) });
    prop.poster(W, { x: 180.0, y: 1.3, z: -1.6, w: 0.8, h: 0.55, pal: pal(4) });
    prop.sacks(W, { x: 181.5, y: 0, z: -1.0, pal: pal(4) });
    prop.table(W, { x: 181.6, y: 0, z: 0.2, w: 0.9, pal: pal(4) });
    rock(178.6, 0.2, 3.0, 0.35); rock(182.2, 0.2, 2.8, 0.3);
    rock(180.5, 0.15, 3.4, 0.3); rock(179.0, 0.15, 3.6, 0.28); // foreground pebbles for the finale layer split

    // ---- little bits of life ----
    const tFajaa = at("وفجأة", 6.23);
    const tTab = at("التعب", 25.54);
    gWorsley.place(tTab, [118.4, 0.9]); gWorsley.face(tTab, "sleepy");
    gCrean.place(tTab, [121.6, 0.9]); gCrean.face(tTab, "sleepy");
    const tWorsley = at("وورسلي", 37.33, 35);
    const tKreen = at("وكرين", 39.63, 35);
    gWorsley.face(tWorsley, "sad"); gWorsley.talk(tWorsley, tKreen);
    shack.face(tFajaa, "surprised");
    shack.face(at("حكى", 33.6), "worried");
    const tZahira = at("ظاهرة", 50.4);
    prof.talk(tZahira, 53.2);

    // fx: the presence (dust kick), the stomp, the collapse
    fx.emit("dust", tHasis, tHasis + 1.2, [1.9, 0, -1.1], { size: 0.7 });
    fx.emit("ring", at("حبل", 22.38), at("حبل", 22.38) + 0.7, [120, 0.1, 0], { size: 0.8, color: "#dff0ff" });
    fx.emit("dust", tTab + 0.35, tTab + 1.4, [118.4, 0, 0.9], { size: 0.6 });
    fx.emit("dust", tTab + 0.6, tTab + 1.6, [121.6, 0, 0.9], { size: 0.6 });
    fx.emit("sparkle", tTalata, tQ1, [121.7, 1.2, -0.9], { size: 0.5, color: "#9fd8ff" });

    // ---- camera (times from the word clock) ----
    const tGedam = at("قدامه", 12.97);       // the three in the boat
    const tYaddo = at("يعدوا", 19.52);       // the crossing
    const tHabl = at("حبل", 22.38);          // the gear
    const tSabo = at("سابهم", 28.82);        // the five-minute lie
    const tSahahom = at("صحاهم", 30.76);     // waking them + the secret (night)
    const tQ2 = at("وبحارة", 46.49);
    const tQ3 = at("وناجين", 46.84);
    const tQ4 = at("حكوا", 48.05);           // the unseen companion
    const tHakwa = at("عن", 48.4, 47.9) + 0.6;   // finale hold (~5.2 s)

    const plan = [
      // 1 — hook: his face, mid-trek (0 → حاسس, the long hold)
      { shot: "hook_closeup", t: 0, subject: { pos: [1.6, 1.45, 1.2], name: "shack" }, opts: { light: "day", yaw: 1.15, dist: 1.9 } },
      // 2 — the fourth man, behind him
      { shot: "silhouette", t: tHasis, subject: { pos: [1.9, 1.2, -1.1], name: "fig4" }, opts: { light: "day" } },
      // 3 — whip into the storm: 16 days in the lifeboat
      { shot: "aerial_sweep", t: tBod, subject: { pos: [60, 0.5, 0] }, opts: { light: "night" }, transition: "whip", whipDir: 1 },
      // 4 — the three of them in the boat (long hold)
      { shot: "two_shot", t: tGedam, subject: { pos: [60, 1.2, 0.3], name: "boat_shack" }, opts: { light: "night" } },
      // 5 — the icy range they must cross
      { shot: "aerial_sweep", t: tYaddo, subject: { pos: [120, 0.5, 0] }, opts: { light: "day" } },
      // 6 — the gear: rope, axe, hobnails
      { shot: "macro_glide", t: tHabl, subject: { pos: [118.3, 0.4, -1.8] }, opts: { light: "day", focus: [118.3, 0.4, -1.8] } },
      // 7 — Worsley and Crean collapse
      { shot: "group_reaction", t: tTab, subject: { pos: [118.4, 0.9, 0.9], name: "camp_worsley" }, opts: { light: "golden" } },
      // 8 — the five-minute lie: he stands guard, then the secret (night, long hold)
      { shot: "top_down", t: tSabo, subject: { pos: [120, 0.6, 0.8] }, opts: { light: "golden" } },
      { shot: "tight_closeup", t: tSahahom, subject: { pos: [120, 1.45, 0], name: "camp_shack" }, opts: { light: "night" } },
      // 9 — all three felt it, the fourth shape by the fire
      { shot: "group_reaction", t: tTalata, subject: { pos: [121.3, 1.0, 0.8], name: "camp_crean" }, opts: { light: "night" } },
      // 10-13 — quick cluster: climbers, sailors, survivors, and the unseen companion
      { shot: "quick_cut", t: tQ1, subject: { pos: [7, 1.3, 4], name: "climber" }, opts: { light: "golden" } },
      { shot: "quick_cut", t: tQ2, subject: { pos: [66, 1.3, 2], name: "helmsman" }, opts: { light: "night" } },
      { shot: "quick_cut", t: tQ3, subject: { pos: [150, 1.3, 0], name: "survivor" }, opts: { light: "golden" } },
      { shot: "silhouette", t: tQ4, subject: { pos: [121.7, 1.2, -0.9], name: "fig4b" }, opts: { light: "night" } },
      // 14 — the study: "ظاهرة الرجل الثالث", dissolve and hold to the end
      { shot: "godray_finale", t: tHakwa, subject: { pos: [180.3, 1.5, 0.4], name: "prof" }, opts: { light: "interior" }, transition: "dissolve", tframes: 12 },
    ];
    const keys = shotList({ aim, aerial }, plan);
    const shotCheck = checkShotList(keys);
    if (!shotCheck.pass) console.error("[rc] shot-list check:", shotCheck.failures.join(" | "));

    // camera kicks on the gear pile, the collapse and the wake-up
    const kicks = [
      { t: tHabl + 0.8, amp: 0.05 },
      { t: tTab + 0.35, amp: 0.06 },
      { t: tSahahom + 0.3, amp: 0.04 },
    ];

    return { camera: keys, kicks };
  },
};

