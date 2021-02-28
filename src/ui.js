const chalk   = require("chalk");
const blessed = require("blessed");
const contrib = require("blessed-contrib");
const fs = require("fs");

const results = [];
const screen  = blessed.screen();
const grid    = new contrib.grid({rows: 12, cols: 12, screen: screen});

const layouts = grid.set(0, 0, 8, 6, contrib.table, {
  label:         "Top layouts",
  content:       "Waiting...",
  keys:          true,
  interactive:   true,
  fg:            'gray',
  selectedBg:    'cyan',
  columnSpacing: 0,
  columnWidth:   [20, 10, 10, 12, 12]
});

const details = grid.set(0, 6, 7, 6, blessed.box, {
  label:   "Keyboard details",
  content: "Waiting...",
  padding: 1
});

const roll = grid.set(7, 6, 5, 6, blessed.log, {
  label:   "Analyzing variations",
  content: "Waiting...",
  padding: 1
});

const genesis = grid.set(8, 0, 4, 6, blessed.box, {
  label:   "Genetics info",
  content: "Loading...",
  padding: 1
});

const chart = contrib.line({
  height:           12,
  top:              1,
  xPadding:         1,
  xLabelPadding:    1,
  wholeNumbersOnly: true,
  showLegend:       false
});
genesis.append(chart);

const breaks_bar = contrib.gauge({
  showLabel: false,
  height:  3,
  top:     5,
  left:    20,
  width:   30
});
genesis.append(breaks_bar);

const breaks_label = blessed.text({
  content: "No changes in 0/0",
  top:      7
});
genesis.append(breaks_label);

const fingers_chart = contrib.bar({
  top:        7,
  showLabel:  false,
  barWidth:   2,
  barSpacing: 1,
  xOffset:    0,
  maxHeight:  4,
  height:     7,
  barBgColor: 'cyan'
});

details.append(fingers_chart);

layouts.on("item", (row) => {
  details.setContent(String(row));
});

screen.render();

screen.key(['escape', 'q', 'C-c'], () => {
  process.exit(0);
});

exports.newPopulation = function newPopulation(population, use_elites, mutate_level) {
  genesis.setContent(
    `Generation: ${chalk.yellow(population.number)}, `+
    `Elites: ${use_elites ? chalk.green('YES') : chalk.red('NO')}, `+
    `Mutation Level: ${mutate_level}`
  );

  roll.setContent("");

  screen.render();
}

exports.logGrade = function logGrade(layout, score) {
  roll.log(chalk.grey(`Finished: ${layout.name} ..... ${humanize(score.total)}`));
}

exports.addResult = function addResult(layout, score, no_changes_in, max_no_chage) {
  const { data: { overheads: { sameFinger, sameHand, shifting} } } = score;
  const overheads = {
    finger: sameFinger / score.effort * 100 | 0,
    hand: sameHand / score.effort * 100 | 0,
    shift: shifting / score.effort * 100 | 0
  };

  details.setContent(
    `Name: ${chalk.red(layout.name)}, scored: ${chalk.yellow(humanize(score.total))}, dist: ${chalk.magenta(humanize(score.position))}\n\n` +
    `${heatmap(layout.toString())}\n\n` +
    `\n\n\n\n\n\n\n`+
    `Symmetry: ${chalk.gray(score.symmetry+"%")}\n`+
    `Evenness: ${chalk.gray(score.evenness+"%")}\n`+
    `Hands: ${chalk.gray(score.handsUsage.map(v => v+"%").join(" | "))}\n`+
    `Overheads: ${chalk.gray(`F:${overheads.finger}%, H:${overheads.hand}%, S:${overheads.shift}%`)}, RDi:${score.reverseOrderDigrams}%`
  );

// fs.appendFileSync("results", layout.name+"\n");
// fs.appendFileSync("results", "Symmetry: "+score.symmetry+ "\n");
// fs.appendFileSync("results", "Evenness: " + score.evenness+"\n");
// fs.appendFileSync("results", "Hands: " + score.handsUsage.map(v=>v+"%").join(" | ") +"\n");
// fs.appendFileSync("results", "Overheads: F: "+overheads.finger + " H: " +overheads.hand+" ReverseOrderDigrams: "+ score.reverseOrderDigrams+ "%\n");
// fs.appendFileSync("results", "Fingers usage: "+ score.fingersUsage+ "\n");
// fs.appendFileSync("results", "\n");
  // fs.appendFileSync("results", +"\n");

  fingers_chart.setData({
    titles: score.fingersUsage.map(() => " "),
    data:   score.fingersUsage
  });

  results.push({layout: layout, score: score});
  rebuildLayoutsTable();
  redrawResultsChart();

  breaks_bar.setPercent(Math.round(no_changes_in / max_no_chage * 100));
  breaks_label.setContent(`No changes in ${no_changes_in || 0}/${max_no_chage || 0}`);

  screen.render();
}

exports.destroy = function destroy() {
  screen.destroy();
}

function humanize(score) {
  let pres = score < 1000000 ? 4 : score < 10000000 ? 3 : 2;
  let res = (score / 1000000).toFixed(pres) + "M";
  while (res.length < 5) { res = " " + res; }
  return res;
}

function vs_known(total, vs) {
  const percent = total / vs * 100;
  const diff    = (percent - 100).toFixed(3);

  if (diff < 0) {
    return chalk.red(`${diff}%`);
  } else if (diff == 0) {
    return chalk.grey(` ${diff}%`);
  } else {
    return chalk.green(`+${diff}%`);
  }
}

function rebuildLayoutsTable() {
  const uniq = results.reduce((list, item) => {
    const match = list.filter(i => {
      return i.layout.config === item.layout.config
    }).length !== 0;

    return match ? list : list.concat([item]);
  }, []);

  const sorted = uniq.sort((a, b) => {
    return a.score.total > b.score.total ? -1 : 1;
  });

  const qwerty  = sorted.filter(r => r.layout.name === "QWERTY")[0];
  const workman = sorted.filter(r => r.layout.name === "Workman")[0];

  const data = sorted.map(result => {
    return [
      result.layout.name,
      humanize(result.score.total),
      humanize(result.score.position),
      vs_known(result.score.total, workman ? workman.score.total : result.score.total),
      vs_known(result.score.total, qwerty  ? qwerty.score.total  : result.score.total)
    ];
  })

  layouts.setData({
    headers: [' Name', ' Score', ' Dist.', 'vs.Workman', 'vs.QWERTY'].map(i => chalk.magenta(i)),
    data:    data
  });

  layouts.focus();
}

function redrawResultsChart() {
  const scores = results.map(r => r.score.total - results[0].score.total).slice(2);
  const data   = scores.map(score => score / 10000000);

  chart.setData([{ x: Object.keys(data).map(() => ' '), y: data }]);
  // ⠘⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒⠒
}

// https://en.wikipedia.org/wiki/Letter_frequency
const letter_frequencies = {
  о: [10.97, "white"],
  е: [8.45, "white"],
  а: [8.01, "yellow"],
  и: [7.35, "yellow"],
  н: [6.70, "yellow"],
  т: [6.26, "yellow"],
  с: [5.47, "yellow"],
  р: [4.73, "red"],
  в: [4.54, "red"],
  л: [4.40, "red"],
  к: [3.49, "red"],
  м: [3.21, "magenta"],
  д: [2.98, "magenta"],
  п: [2.81, "magenta"],
  у: [2.62, "magenta"],
  я: [2.01, "magenta"],
  ы: [1.90, "magenta"],
  ь: [1.74, "magenta"],
  г: [1.70, "magenta"],
  з: [1.65, "cyan"],
  б: [1.59, "cyan"],
  ч: [1.44, "cyan"],
  й: [1.21, "blue"],
  х: [0.97, "blue"],
  ж: [0.94, "blue"],
  ш: [0.73, "blue"],
  ю: [0.64, "grey"],
  ц: [0.48, "grey"],
  щ: [0.36, "grey"],
  э: [0.32, "grey"],
  ф: [0.26, "grey"],
  ъ: [0.04, "grey"],
  ё: [0.04, "grey"]
};

function heatmap(layout) {
  let result = "";

  for (let i=0; i < layout.length; i++) {
    const letter = layout[i];
    const [frequency, color] = letter_frequencies[letter] || [];

    result += chalk[ color || "gray" ](letter);
  }

  return result;
}
