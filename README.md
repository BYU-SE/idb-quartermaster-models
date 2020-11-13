# Incident Database Quartermaster models

Use [Quartermaster](https://github.com/BYU-SE/quartermaster) to model incidents from the [Incident Database](https://github.com/BYU-SE/idb) (IDB).

---

## Installation

To explore and develop locally, you can clone this repository. Then, run `npm i` to install dependencies. The models are written in TypeScript.

## Usage

```
npm run incident 1-buildkite
```

Runs the incident model included in `1-buildkite`, which produces the following output:

```
Overview of event behavior in stage
┌─────────┬────────────────────┬────────┬───────────┬────────┬──────────┬─────────┬───────┐
│ (index) │       stage        │  add   │ queueTime │ workOn │ workTime │ success │ fail  │
├─────────┼────────────────────┼────────┼───────────┼────────┼──────────┼─────────┼───────┤
│    0    │     'Timeout'      │ 160000 │     0     │ 160000 │ 1398832  │  69675  │ 90325 │
│    1    │       'ELB'        │ 160000 │    25     │ 160000 │ 1376376  │  69675  │ 90325 │
│    2    │ 'DashboardService' │  5248  │     9     │  5248  │  103298  │  5247   │   1   │
│    3    │ 'DashboardService' │ 16998  │     9     │ 16998  │  332700  │  16967  │  31   │
│    4    │ 'DashboardService' │  5248  │     9     │  5248  │  103348  │  5247   │   1   │
│    5    │ 'DashboardService' │ 42997  │     9     │ 42997  │  827724  │  42214  │  783  │
│    6    │     'Database'     │ 70491  │   35502   │ 69706  │  801842  │  69675  │  31   │
└─────────┴────────────────────┴────────┴───────────┴────────┴──────────┴─────────┴───────┘
Overview of Events
┌─────────┬───────────┬───────┬─────────┬──────────────┬─────────────┐
│ (index) │   type    │ count │ percent │ mean_latency │ std_latency │
├─────────┼───────────┼───────┼─────────┼──────────────┼─────────────┤
│    0    │ 'success' │ 69675 │ '0.435' │   '21.191'   │   '3.310'   │
│    1    │  'fail'   │ 90325 │ '0.565' │   '1.817'    │   '0.791'   │
└─────────┴───────────┴───────┴─────────┴──────────────┴─────────────┘
Global stats instance table 'poll':
┌─────────┬───────┬───────────┬────────────┬────────────────────┬────────────────────┐
│ (index) │  now  │ eventRate │ concurrent │        cpu         │ dashboardInstances │
├─────────┼───────┼───────────┼────────────┼────────────────────┼────────────────────┤
│    0    │ 1000  │   4000    │     50     │ 0.7692307692307693 │         4          │
│    1    │ 2000  │   4100    │     53     │ 0.8153846153846154 │         4          │
│    2    │ 3000  │   4200    │     53     │ 0.8153846153846154 │         4          │
│    3    │ 4000  │   4300    │     56     │ 0.8615384615384616 │         4          │
│    4    │ 5000  │   4400    │     52     │        0.8         │         2          │
│    5    │ 6000  │   4500    │     52     │        0.8         │         2          │
│    6    │ 7000  │   4600    │     53     │ 0.8153846153846154 │         2          │
│    7    │ 8000  │   4700    │     56     │ 0.8615384615384616 │         2          │
│    8    │ 9000  │   4800    │     59     │ 0.9076923076923077 │         2          │
│    9    │ 10000 │   4900    │     60     │ 0.9230769230769231 │         1          │
│   10    │ 11000 │   5000    │     65     │         1          │         1          │
│   11    │ 12000 │   5100    │     56     │ 0.8615384615384616 │         1          │
│   12    │ 13000 │   5200    │     64     │ 0.9846153846153847 │         1          │
│   13    │ 14000 │   5300    │     64     │ 0.9846153846153847 │         1          │
│   14    │ 15000 │   5400    │     63     │ 0.9692307692307692 │         0          │
│   15    │ 16000 │   5500    │     0      │         0          │         0          │
│   16    │ 17000 │   5600    │     0      │         0          │         0          │
│   17    │ 18000 │   5700    │     0      │         0          │         0          │
│   18    │ 19000 │   5800    │     0      │         0          │         0          │
│   19    │ 20000 │   5900    │     0      │         0          │         0          │
│   20    │ 21000 │   6000    │     0      │         0          │         0          │
│   21    │ 22000 │   6100    │     0      │         0          │         0          │
│   22    │ 23000 │   6200    │     0      │         0          │         0          │
│   23    │ 24000 │   6300    │     0      │         0          │         0          │
│   24    │ 25000 │   6400    │     0      │         0          │         0          │
│   25    │ 26000 │   6500    │     0      │         0          │         0          │
│   26    │ 27000 │   6600    │     0      │         0          │         0          │
│   27    │ 28000 │   6700    │     0      │         0          │         0          │
│   28    │ 29000 │   6800    │     0      │         0          │         0          │
└─────────┴───────┴───────────┴────────────┴────────────────────┴────────────────────┘
```

## Contributing to this Repository

Use the same identifiers as included in the IDB. The format for each directory is `{incident id}-{company}`. This schema may change at a later time, so linking to a specific incident model directory should be avoided.

Each directory should contain this format:

```
{incident id}-{company}
  - incident.ts
  ... other files/directories as needed
```

| File/Directory | Description                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `incident.ts`  | The entry point for running the incidents. This is called when `npm run model {incident id}-{company}` is executed. |
