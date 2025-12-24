import { bench, do_not_optimize, run, summary, type k_state } from "mitata";

summary(() => {
  bench("bigint shifting", function* (state: k_state) {
    const a = state.get("a") as number;

    yield {
      [0]() {
        return BigInt(a);
      },
      bench(a: bigint) {
        return do_not_optimize(a << 5n);
      },
    };
  }).args({ a: [123, 456] });

  bench("number shifting", function* (state: k_state) {
    const a = state.get("a") as number;

    yield {
      [0]() {
        return a;
      },
      bench(a: number) {
        return do_not_optimize(a << 5);
      },
    };
  }).args({ a: [123, 456] });
});

run();
