import {
  run,
  bench,
  boxplot,
  summary,
  type k_state,
  B,
  do_not_optimize,
  lineplot,
} from "mitata";

const array = [
  "be kind whenever possible",
  "dream big work hard stay focused",
  "every moment is a fresh start",
  "find beauty in everyday things",
  "follow your heart not the crowd",
  "happiness is an inside job",
  "kindness costs you absolutely nothing",
  "life is what you make it",
  "love is all you need now",
  "never stop exploring this world",
  "our time here is finite",
  "pursue your dreams relentlessly always",
  "stay true to who you are",
  "the best is yet to come",
  "this too shall pass always",
  "yesterday is gone tomorrow may never come",
];

const object: Record<string, number> = {};
const map: Map<string, number> = new Map();

for (let i = 0; i < array.length; i++) {
  object[array[i]] = i;
  map.set(array[i], i);
}

const indexes = [0, 3, 8, 15, 16, 17];

lineplot(() => {
  summary(() => {
    bench("indexOf $index", function* indexOf(state: k_state) {
      const item = array[state.get("index")];
      yield () => do_not_optimize(array.indexOf(item));
    }).args({ index: indexes });
  });
});

lineplot(() => {
  summary(() => {
    bench("objectGet $index", function* objectGet(state: k_state) {
      const item = array[state.get("index")];
      yield () => do_not_optimize(object[item]);
    }).args({ index: indexes });
  });
});

lineplot(() => {
  summary(() => {
    bench("mapGet $index", function* mapGet(state: k_state) {
      const item = array[state.get("index")];
      yield () => do_not_optimize(map.get(item));
    }).args({ index: indexes });
  });
});

await run();
