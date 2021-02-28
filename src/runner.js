const { EFFORT_LIMIT, SAME_FINGER_PENALTY, SAME_HAND_PENALTY } = require('./config');
const fs = require("fs");

const fingersOrder ={
  'l-pinky': 14,
  'l-ring': 13,
  'l-middle': 12,
  'l-point': 11,
  'r-pinky': 24,
  'r-ring': 23,
  'r-middle': 22,
  'r-point': 21,
  'thumb':  0,
};

module.exports = class Runner {
  constructor(text, options) {
    this.text = text.trim();
    this.options = options;
  }

  typeWith(layout) {
    const {
      effortLimit       = EFFORT_LIMIT,
      sameFingerPenalty = SAME_FINGER_PENALTY,
      sameHandPenalty   = SAME_HAND_PENALTY
    } = this.options;
    const mapping = layout.toMetrics();
    const text = this.text;
    const L_SHIFT = mapping['l-shift'];
    const R_SHIFT = mapping['r-shift'];
    const counts  = Object.assign(Object.create(null), {
      'l-pinky': [0,0,0,0,0], 'l-ring': [0,0,0,0,0], 'l-middle': [0,0,0,0,0], 'l-point': [0,0,0,0,0],
      'r-pinky': [0,0,0,0,0], 'r-ring': [0,0,0,0,0], 'r-middle': [0,0,0,0,0], 'r-point': [0,0,0,0,0]
    });

    let position = 0;
    let distance = 0;
    let effort = 0;
    let sameFingerOverheads = 0;
    let sameHandOverheads = 0;
    let shiftingOverheads = 0;
    let prevKey = mapping[' '];
    let prevShift = false;
    let allDigrams = 0;
    let reverseOrderDigrams = 0;

    while (effort < effortLimit) {
      const i = position++ % text.length;
      const symbol = text[i];
      const key = mapping[symbol];
      if (key === undefined) {
        prevKey = mapping[' '];
        continue;
      }

      const hand = key.hand;
      const finger = key.finger;

      // console.log(JSON.stringify(symbol), key.finger, key.hand, key.effort, 'prev shift', prevShift && prevShift.hand);

      // basic calculation
      distance += key.distance;
      effort += key.effort;

      // various hand movement overheads
      if (hand !== false && key !== prevKey) { // skipping repeats and spaces
        // fs.appendFileSync("keys-type", JSON.stringify(prevKey)+" - "+ JSON.stringify(key)+"\n");
        if (finger === prevKey.finger) { // same finger usage penalty
          const prevEffort = prevKey.effort + 1;
          const overhead = prevEffort * sameFingerPenalty;
          // console.log('      same finger overhead', overhead);
          effort += overhead;
          sameFingerOverheads += overhead;
        } else if (hand === prevKey.hand) { // same hand usage penalty
          if (prevKey.finger!="thumb" && key.finger!="thumb") {
            allDigrams++;
            // fs.appendFileSync("keys-type", "AllDi: " +allDigrams+"\n");
          }
          const prevEffort = prevKey.effort + 1;
          const overhead = prevEffort * sameHandPenalty;
          // console.log('      same hand overhead', overhead);
          effort += overhead;
          sameHandOverheads += overhead;
          if (fingersOrder[prevKey.finger] < fingersOrder[key.finger] && prevKey.finger!="thumb" && key.finger!="thumb") {
            reverseOrderDigrams++;
            // fs.appendFileSync("keys-type", "ReverseOrderDi: " +reverseOrderDigrams+"\n");
          }


        } else if (prevShift !== null && prevShift.hand === hand) { // retraction from a shift position penalty
          const overhead = prevShift.effort * sameHandPenalty;
          // console.log('     retraction from shift overhead');
          effort += overhead;
          shiftingOverheads += overhead;
        }
      }

      // pressing the shift button overhead
      if (key.shift) {
        prevShift = hand === 'r' ? L_SHIFT : R_SHIFT;
      } else {
        prevShift = null;
      }

      // handling the counting
      if (hand !== false) {
        counts[finger][key.row] += 1;
      }

      prevKey = key;
    }

    return {
      position,
      distance,
      effort: Math.round(effort),
      overheads: {
        sameHand: Math.round(sameHandOverheads),
        sameFinger: Math.round(sameFingerOverheads),
        shifting: Math.round(shiftingOverheads),
      },
      reverseOrderDigrams: Math.round(reverseOrderDigrams/allDigrams*100),
      counts
    };
  }
};
